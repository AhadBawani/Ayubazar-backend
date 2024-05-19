const Product = require('../../Models/ProductsModel');
const path = require('path');
const ExcelJS = require('exceljs');

module.exports.ADD_PRODUCT = async (req, res) => {
    const { productName, productCompany, description, options, bulletDescription, productCategory } = req.body;
    try {
        await Product.findOne({ productName: productName, productCompany: productCompany })
            .exec()
            .then(async (response) => {
                if (response) {
                    res.status(409).send({
                        message: "Product already exists!"
                    })
                }
                else {
                    if (!req.files || Object.keys(req.files).length === 0) {
                        return res.status(400).json({ message: 'No files were uploaded.' });
                    }

                    const productImage = req.files.productImage;
                    const uploadPath = path.join(__dirname, '..', '..', 'Images', 'ProductImages', productImage.name);
                    await productImage.mv(uploadPath);

                    const product = new Product({
                        productName: productName,
                        productCompany: productCompany,
                        productCategory: productCategory,
                        productImage: productImage.name,
                        description: description,
                        bulletDescription: bulletDescription,
                        options: options,
                        outOfStock: false,
                        discount: null
                    }).save();

                    product.then(productResponse => {
                        res.status(201).json({
                            message: "Product created successfull!",
                            product: {
                                _id: productResponse._id,
                                productName: productResponse.productName,
                                productImage: productResponse.productImage,
                                productCompany: productResponse.productCompany,
                                productCategory: productResponse.productCategory,
                                description: productResponse.description,
                                bulletDescription: productResponse.bulletDescription,
                                options: productResponse.options,
                                outOfStock: productResponse.outOfStock
                            }
                        });
                    })
                }
            })
    }
    catch (error) {
        console.log("error in add product controller", error);
    }
}

module.exports.ADD_PRODUCT_THROUGH_EXCEL = async (req, res) => {
    try {
        const file = req.files.productsExcel;

        if (!file) {
            return res.status(400).json({ error: 'File not found. Please upload a file.' });
        }        
        const allowedExtensions = ['.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({ error: 'Please upload a valid Excel file (XLSX or XLS).' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.data); // Assuming you have the file data in req.files.productsExcel
        
        const worksheet = workbook.getWorksheet(1); // Assuming the first worksheet
        
        const excelData = [];
        worksheet.eachRow((row, rowNumber) => {
            const rowData = [];
            row.eachCell((cell, colNumber) => {
                rowData.push(cell.value);
            });
            excelData.push(rowData);
        });
        
        res.status(200).json({ message: 'Excel file uploaded successfully.', data: excelData });
    }
    catch (error) {
        console.log('error in add product through excel controller : ', error);
    }
}

module.exports.GET_ALL_PRODUCTS = async (req, res) => {
    try {
        await Product.find()
            .populate('productCompany', '_id companyName')
            .populate('productCategory', '_id category')
            .exec()
            .then((productResponse) => {
                res.status(200).json(productResponse);
            })
    }
    catch (error) {
        console.log("error in get all product controller", error);
    }
}

module.exports.GET_PRODUCT_BY_ID = async (req, res) => {
    const productId = req.params.productId;
    try {
        await Product.findById(productId)
            .exec()
            .then((productResponse) => {
                if (productResponse) {
                    res.status(200).json(productResponse);
                } else {
                    res.status(404).send({
                        message: "Product not found!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in get product by id controller : ', error);
    }
}

module.exports.DISABLE_PRODUCT = async (req, res) => {
    const productId = req.params.productId;

    try {
        await Product.findByIdAndUpdate(productId, { outOfStock: true }, { new: true })
            .exec()
            .then((updateResponse) => {
                if (updateResponse) {
                    res.status(200).send({
                        message: "product is out of stock now!",
                        product: updateResponse
                    })
                }
            })
    }
    catch (error) {
        console.log('error in disable product controller : ', error);
    }
}

module.exports.ENABLE_PRODUCT = async (req, res) => {
    const productId = req.params.productId;

    try {
        await Product.findByIdAndUpdate(productId, { outOfStock: false }, { new: true })
            .exec()
            .then((updateResponse) => {
                if (updateResponse) {
                    res.status(200).send({
                        message: "product is live now!",
                        product: updateResponse
                    })
                }
            })
    }
    catch (error) {
        console.log('error in enable product controller : ', error);
    }
}

module.exports.EDIT_PRODUCT = async (req, res) => {
    const productId = req.params.productId;
    try {
        // Find the product by its ID
        const productResponse = await Product.findById(productId);

        // If the product is not found
        if (!productResponse) {
            return res.status(404).json({ message: "Product not found!" });
        }

        // Get other product details from request body
        const { productName, productCompany, description, options, bulletDescription } = req.body;

        // Update product fields
        if (req.files) {
            const productImage = req.files.productImage;
            const uploadPath = path.join(__dirname, '..', '..', 'Images', 'ProductImages', productImage.name);
            await productImage.mv(uploadPath);
            productResponse.productImage = productImage.name
        }

        productResponse.productName = productName;
        productResponse.productCompany = productCompany;
        productResponse.description = description;
        productResponse.options = options;
        productResponse.bulletDescription = bulletDescription;

        const updatedResponse = await productResponse.save();

        // Send response to client                
        res.status(200).json({
            message: "Product updated successfully!",
            product: updatedResponse
        });
    } catch (error) {
        console.log('Error in edit product controller:', error);
        res.status(500).json({ message: "Internal server error." });
    }
}

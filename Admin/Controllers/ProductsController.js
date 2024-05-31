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
        await workbook.xlsx.load(file.data);

        const worksheet = workbook.worksheets[0]; // Assuming you want to read the first sheet
        const products = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip the header row

            const product = {
                productName: row.getCell(4).value,
                productCompany: row.getCell(5).value,
                productCategory: row.getCell(6).value,
                productSubCategory: row.getCell(7).value,
                bulletDescription: [row.getCell(8).value, row.getCell(9).value, row.getCell(10).value, row.getCell(11).value, row.getCell(12).value, row.getCell(13).value, row.getCell(14).value, row.getCell(15).value, row.getCell(16).value].filter(value => value),
                taxClass: row.getCell(18).value,
                taxStatus: row.getCell(19).value,
                SalesPrice: row.getCell(20).value,
                discount: row.getCell(21).value,
                codAvailable: row.getCell(22).value,
                simpleDescription: [row.getCell(23).value, row.getCell(24).value, row.getCell(25).value, row.getCell(26).value].filter(value => value),
                productOptions: [row.getCell(33).value, row.getCell(34).value, row.getCell(35).value, row.getCell(36).value, row.getCell(37).value].filter(value => value),
                outOfStock: row.getCell(38).value,
                handlingCharges: row.getCell(39).value,
                externalCharges: row.getCell(40).value
            };

            products.push(product);
        });

        res.status(201).json(products);
    }
    catch (error) {
        console.log('error in add product through excel controller : ', error);
        res.status(500).json({ error: 'Internal Server Error' });
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

module.exports.BEST_SELLING_PRODUCT = async (req, res) => {
    const productId = req.params.productId;
    try {
        await Product.findById(productId)
            .exec()
            .then(async (productResponse) => {
                if (productResponse) {
                    if (productResponse.bestSelling) {
                        await Product.findByIdAndUpdate(productId, { bestSelling: false }, { new: true })
                            .exec()
                            .then((productUpdateResponse) => {
                                res.status(200).json({
                                    message: "Product updated successfully!",
                                    response: productUpdateResponse
                                })
                            })
                    } else {
                        await Product.findByIdAndUpdate(productId, { bestSelling: true }, { new: true })
                            .exec()
                            .then((productUpdateResponse) => {
                                res.status(200).json({
                                    message: "Product updated successfully!",
                                    response: productUpdateResponse
                                })
                            })
                    }
                }
                else {
                    res.status(404).json({
                        message: "Product not found!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in best selling product controller : ', error);
    }
}

module.exports.GET_BEST_SALING_PRODUCTS = async (req, res) => {
    try {
        await Product.find({ bestSelling: true })
            .exec()
            .then((productResponse) => {
                res.status(200).json(productResponse);
            })
    }
    catch (error) {
        console.log('error in getting best saling products controller : ', error);
    }
}
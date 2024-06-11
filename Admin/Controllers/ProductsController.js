const Product = require('../../Models/ProductsModel');
const Companies = require('../../Models/CompanyModel');
const Categories = require('../../Models/CategoryModel');
const path = require('path');
const ExcelJS = require('exceljs');

module.exports.ADD_PRODUCT = async (req, res) => {
    const { productName, productCompany, description, options, bulletDescription, productCategory } = req.body;
    try {
        const existingProduct = await Product.findOne({ productName, productCompany }).exec();
        if (existingProduct) {
            return res.status(409).send({ message: "Product already exists!" });
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const imageFiles = req.files.productImages;
        const imageNames = [];

        if (!Array.isArray(imageFiles)) {
            // Single image case
            const uploadPath = path.join(__dirname, '..', '..', 'Images', 'ProductImages', imageFiles.name);
            await imageFiles.mv(uploadPath);
            imageNames.push(imageFiles.name);
        } else {
            // Multiple images case
            for (const file of imageFiles) {
                const uploadPath = path.join(__dirname, '..', '..', 'Images', 'ProductImages', file.name);
                await file.mv(uploadPath);
                imageNames.push(file.name);
            }
        }
        // const mapArr = imageNames.map((item, index) => ({ id: index + 1, productImage: item }));

        const newProduct = new Product({
            productName,
            productCompany,
            productCategory,
            productImages: imageNames,
            description,
            bulletDescription,
            options,
            outOfStock: false,
            discount: null
        });

        const savedProduct = await newProduct.save();

        res.status(201).json({
            message: "Product created successfully!",
            product: {
                _id: savedProduct._id,
                productName: savedProduct.productName,
                productImages: savedProduct.productImages,
                productCompany: savedProduct.productCompany,
                productCategory: savedProduct.productCategory,
                description: savedProduct.description,
                bulletDescription: savedProduct.bulletDescription,
                options: savedProduct.options,
                outOfStock: savedProduct.outOfStock
            }
        });
    } catch (error) {
        console.log("Error in add product controller", error);
        res.status(500).send({ message: 'Server error. Please try again later.' });
    }
};

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
            const rawProductOptions = [
                row.getCell(33).value, row.getCell(34).value, row.getCell(35).value,
                row.getCell(36).value, row.getCell(37).value
            ].filter(value => value);

            const productOptions = rawProductOptions.map((option) => {
                const splited = option.split('-');
                if (splited.length === 2) {
                    return {
                        option: splited[0].trim(),
                        price: splited[1].trim()
                    };
                } else {
                    console.error(`Invalid option format: ${option}`);
                    return null;
                }
            }).filter(option => option !== null);
            const product = {
                productName: row.getCell(4).value,
                productCompany: row.getCell(5).value,
                productCategory: row.getCell(6).value,
                productSubCategory: row.getCell(7).value,
                bulletDescription: [row.getCell(8).value, row.getCell(9).value, row.getCell(10).value,
                row.getCell(11).value, row.getCell(12).value, row.getCell(13).value, row.getCell(14).value,
                row.getCell(15).value, row.getCell(16).value, row.getCell(17).value]
                    .filter(value => value).map((value, index) => ({ id: index + 1, value })),
                taxClass: row.getCell(18).value,
                taxStatus: row.getCell(19).value,
                SalesPrice: row.getCell(20).value,
                discount: row.getCell(21).value,
                codAvailable: row.getCell(22).value,
                simpleDescription: [row.getCell(23).value, row.getCell(24).value,
                row.getCell(25).value, row.getCell(26).value, row.getCell(27).value, row.getCell(28).value,
                row.getCell(29).value, row.getCell(30).value, row.getCell(31).value, row.getCell(32).value,]
                    .filter(value => value).map((value, index) => ({ id: index + 1, value })),
                productOptions: productOptions,
                outOfStock: row.getCell(38).value,
                handlingCharges: row.getCell(39).value,
                externalCharges: row.getCell(40).value
            };
            if (!product.productCategory) {
                product.productCategory = 'Sample';
            }
            products.push(product);
        });
        for (let i = 0; i < products.length; i++) {
            await Companies.findOne({ companyName: products[i].productCompany })
                .exec()
                .then(async (companyResponse) => {
                    if (companyResponse) {
                        await Categories.findOne({ category: products[i].productCategory, company: companyResponse?._id })
                            .exec()
                            .then(async (categoryResponse) => {
                                if (categoryResponse) {
                                    await new Product({
                                        productName: products[i].productName,
                                        productCompany: companyResponse._id,
                                        productCategory: categoryResponse?._id,
                                        description: products[i]?.simpleDescription > 0 ? JSON.stringify(products[i]?.simpleDescription) : [],
                                        bulletDescription: products[i]?.bulletDescription > 0 ? JSON.stringify(products[i]?.bulletDescription) : [],
                                        options: JSON.stringify(products[i]?.productOptions),
                                        taxClass: products[i]?.taxClass,
                                        taxStatus: products[i]?.taxStatus,
                                        salesPrice: products[i]?.SalesPrice,
                                        discount: products[i]?.discount,
                                        codAvailable: products[i]?.codAvailable,
                                        bestSelling: false,
                                        outOfStock: products[i]?.outOfStock
                                    }).save();
                                }
                                else {
                                    const newCategory = await new Categories({
                                        category: products[i]?.productCategory,
                                        company: companyResponse?._id
                                    }).save();
                                    await new Product({
                                        productName: products[i].productName,
                                        productCompany: companyResponse._id,
                                        productCategory: newCategory?._id,
                                        description: products[i]?.simpleDescription > 0 ? JSON.stringify(products[i]?.simpleDescription) : [],
                                        bulletDescription: products[i]?.bulletDescription > 0 ? JSON.stringify(products[i]?.bulletDescription) : [],
                                        options: JSON.stringify(products[i]?.productOptions),
                                        taxClass: products[i]?.taxClass,
                                        taxStatus: products[i]?.taxStatus,
                                        salesPrice: products[i]?.SalesPrice,
                                        discount: products[i]?.discount,
                                        codAvailable: products[i]?.codAvailable,
                                        bestSelling: false,
                                        outOfStock: products[i]?.outOfStock
                                    }).save();
                                }
                            })
                    }
                    else {
                        const newCompany = await new Companies({
                            companyImage: null,
                            companyName: products[i]?.productCompany
                        }).save();

                        const newCategory = await new Categories({
                            category: products[i]?.productCategory,
                            company: newCompany?._id
                        }).save();

                        await new Product({
                            productName: products[i].productName,
                            productCompany: newCompany._id,
                            productCategory: newCategory?._id,
                            description: products[i]?.simpleDescription > 0 ? JSON.stringify(products[i]?.simpleDescription) : [],
                            bulletDescription: products[i]?.bulletDescription > 0 ? JSON.stringify(products[i]?.bulletDescription) : [],
                            options: JSON.stringify(products[i]?.productOptions),
                            taxClass: products[i]?.taxClass,
                            taxStatus: products[i]?.taxStatus,
                            salesPrice: products[i]?.SalesPrice,
                            discount: products[i]?.discount,
                            codAvailable: products[i]?.codAvailable,
                            bestSelling: false,
                            outOfStock: products[i]?.outOfStock
                        }).save();
                    }
                })
        }
        res.status(201).json({
            message: "Products added successfully!"
        });
    }
    catch (error) {
        console.log('error in add product through excel controller : ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports.GET_ALL_PRODUCTS = async (req, res) => {
    const products = await Product.find({})
        .populate('productCompany', '_id companyName')
        .populate('productCategory', '_id category')
        .exec();

    res.status(200).json(products);
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
        const productResponse = await Product.findById(productId);

        if (!productResponse) {
            return res.status(404).json({ message: "Product not found!" });
        }

        const { productName, productCompany, description,
            options, bulletDescription, taxStatus, taxClass } = req.body;
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const imageFiles = req.files.productImages;
        const imageNames = [];

        if (!Array.isArray(imageFiles)) {
            const uploadPath = path.join(__dirname, '..', '..', 'Images', 'ProductImages', imageFiles.name);
            await imageFiles.mv(uploadPath);
            imageNames.push(imageFiles.name);
        } else {
            for (const file of imageFiles) {
                const uploadPath = path.join(__dirname, '..', '..', 'Images', 'ProductImages', file.name);
                await file.mv(uploadPath);
                imageNames.push(file.name);
            }
        }

        productResponse.productName = productName;
        productResponse.productCompany = productCompany;
        productResponse.description = description;
        productResponse.productImages = imageNames;
        productResponse.options = options;
        productResponse.taxClass = taxClass;
        productResponse.taxStatus = taxStatus;
        productResponse.bulletDescription = bulletDescription;
        const updatedResponse = await productResponse.save();

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
        await Product.find({ bestSelling: true, productImages: { $ne: [] } })
            .exec()
            .then((productResponse) => {
                res.status(200).json(productResponse);
            })
    }
    catch (error) {
        console.log('error in getting best saling products controller : ', error);
    }
}

module.exports.TOGGLE_COD_AVAILABLE = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findById(productId).exec();

        if (!product) {
            return res.status(404).json({
                message: "Invalid Request!"
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { codAvailable: !product.codAvailable },
            { new: true }
        ).exec();

        if (updatedProduct) {
            return res.status(200).json({
                message: "Product updated successfully!",
                response: updatedProduct
            });
        } else {
            return res.status(500).json({
                message: "Failed to update the product!"
            });
        }
    } catch (error) {
        console.log('Error in toggling COD availability:', error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

module.exports.GET_LATEST_PRODUCTS = async (req, res) => {
    try {
        const latestProducts = await Product.find({ productImages: { $ne: [] } }).sort({ createdAt: -1 }).limit(10).exec();
        res.status(200).json(latestProducts);
    }
    catch (error) {
        console.log('error in getting all the latest products : ', error);
    }
}

module.exports.GET_NARAYANI_PRODUCTS = async (req, res) => {
    try {
        await Companies.findOne({ companyName: 'Narayani' })
            .exec()
            .then((companyResponse) => {
                if (companyResponse) {                    
                    Product.find({ productCompany: companyResponse._id }).exec()
                    .then((productResponse) => {
                        if(productResponse){                            
                            res.status(200).json(productResponse);
                        }
                    });
                }
            })
        
    }
    catch (error) {
        console.log('error in getting narayani product controller : ', error);
    }
}
const Product = require('../../Models/ProductsModel');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./Images/ProductImages");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage }).single('productImage');

module.exports.ADD_PRODUCT = async (req, res) => {
    const { productName, productCompany, description, options, bulletDescription, productCategory } = req.body;
    console.log(req.body);
    try {
        await Product.findOne({ productName: productName, productCompany: productCompany })
            .exec()
            .then((response) => {
                if (response) {
                    res.status(409).send({
                        message: "Product already exists!"
                    })
                }
                else {
                    const product = new Product({
                        productName: productName,
                        productCompany: productCompany,
                        productCategory: productCategory,
                        productImage: req.file.filename,
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
        productResponse.productName = productName;
        productResponse.productCompany = productCompany;
        productResponse.description = description;
        productResponse.options = options;
        productResponse.bulletDescription = bulletDescription;

        // If a new image is uploaded, update the product image
        if (req.file) {
            productResponse.productImage = req.file.filename;
        }

        // Save the updated product
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

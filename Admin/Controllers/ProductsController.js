const Product = require('../../Models/ProductsModel');

module.exports.ADD_PRODUCT = async (req, res) => {
    const { productName, productCompany, description, options, bulletDescription } = req.body;
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
                        productImage: req.file.filename,
                        description: description,
                        bulletDescription:bulletDescription,
                        options: options,
                        outOfStock: false,
                        discount:null
                    }).save();

                    product.then(productResponse => {
                        res.status(201).json({
                            message: "Product created successfull!",
                            product: {
                                _id: productResponse._id,
                                productName: productResponse.productName,
                                productImage: productResponse.productImage,
                                productCompany: productResponse.productCompany,
                                description: productResponse.description,
                                bulletDescription:productResponse.bulletDescription,
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
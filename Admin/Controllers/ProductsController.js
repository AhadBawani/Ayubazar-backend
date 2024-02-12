const Product = require('../../Models/ProductsModel');

module.exports.ADD_PRODUCT = async (req, res) => {
    const { productName, productCompany, description, options } = req.body;
    try {                
        await Product.findOne({ productName: productName, productCompany: productCompany })
            .exec()
            .then((response) => {
                if (response) {
                    res.status(409).send({
                        message: "Company already exists!"
                    })
                }
                else {
                    const product = new Product({
                        productName: productName,
                        productCompany: productCompany,
                        productImage: req.file.filename,
                        description: description,
                        options: options,
                        outOfStock: false,
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
        await Product.find({ outOfStock:false })
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
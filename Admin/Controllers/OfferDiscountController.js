const OfferDiscount = require('../../Models/OfferDiscountModel');
const Products = require('../../Models/ProductsModel');

module.exports.CREATE_OFFER = async (req, res) => {
    const { discountTitle, discountPercentage, expiryDate, productArr } = req.body;
    try {
        await OfferDiscount.deleteMany({});
        const offerDiscount = await OfferDiscount.create({
            discountTitle: discountTitle,
            discountPercentage: discountPercentage,
            expiryDate: expiryDate,
            products: productArr,
            expired: false
        });
        if (offerDiscount) {
            for (let i = 0; i < productArr.length; i++) {
                const product = await Products.findById(productArr[i]);
                if (product) {
                    const updatedOptions = JSON.parse(product.options)?.map((opt, index) => {
                        const price = parseFloat(opt.price);
                        const discountedPrice = Math.round(price - (price * discountPercentage) / 100);
                        return { ...opt, price: discountedPrice.toString() };
                    })
                    await Products.findByIdAndUpdate(productArr[i],
                        {
                            options: JSON.stringify(updatedOptions),
                            discount: discountPercentage
                        },
                        { new: true });
                }
            }
            return res.status(201).send({
                message: "Offer created successfully!",
                offer: offerDiscount
            });
        }
    } catch (error) {
        console.log('error in create offer controller : ', error);
        return res.status(500).send({ message: "Internal server error" });
    }
};

module.exports.GET_DISCOUNT_OFFER = async (req, res) => {
    try {
        await OfferDiscount.findOne({ expired: false })
            .exec()
            .then((response) => {
                res.status(200).json(response);
            })
    }
    catch (error) {
        console.log('error in discount offer : ', error);
    }
}
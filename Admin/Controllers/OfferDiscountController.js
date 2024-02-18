const OfferDiscount = require('../../Models/OfferDiscountModel');
const Products = require('../../Models/ProductsModel');

module.exports.CREATE_OFFER = async (req, res) => {
    const { discountTitle, discountPercentage, expiryDate, productArr } = req.body;

    try {
        await OfferDiscount.deleteMany({});
        const offerDiscount = new OfferDiscount({
            discountTitle: discountTitle,
            discountPercentage: discountPercentage,
            expiryDate: expiryDate,
            products:productArr,
            expired: false
        }).save();

        offerDiscount
            .then((offerResponse) => {
                if (offerResponse) {
                    for (let i = 0; i < productArr.length; i++) {
                        Products.findByIdAndUpdate(productArr[i]._id, { discount: discountPercentage }, { new: true })
                            .exec()
                            .then((productResponse) => {

                            })
                            .catch((error) => {
                                console.log('error in discount controller : ', error);
                            })
                    }
                    res.status(201).send({
                        message: "Offer created successfully!",
                        offer: offerResponse
                    })
                }
            })
    }
    catch (error) {
        console.log('error in create offer controller : ', error);
    }
}

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
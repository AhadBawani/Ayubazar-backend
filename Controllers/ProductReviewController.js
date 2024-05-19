const ProductReview = require('../Models/ProductReviewModel');

module.exports.ADD_PRODUCT_REVIEW = async (req, res) => {
    const { productId, rating, review, userId } = req.body;
    try {
        const productReview = new ProductReview({
            productId: productId,
            rating: rating,
            review: review,
            userId: userId,
            deleteReview: false
        }).save();

        productReview
            .then((reviewResponse) => {
                if (reviewResponse) {
                    res.status(201).send({
                        message: "review added successfully!",
                        review: reviewResponse
                    })
                }
            })
    }
    catch (error) {
        console.log('error in add review controller : ', error);
    }
}

module.exports.GET_PRODUCT_REVIEWS_ID = async (req, res) => {
    const productId = req.params.productId;

    try {
        await ProductReview.find({ productId: productId })
            .populate('userId', 'displayName email firstName lastName')
            .exec()
            .then((productReviewResponse) => {
                if (productReviewResponse) {
                    res.status(200).json(productReviewResponse);
                }
            })
    }
    catch (error) {
        console.log('error in getting product review by ID : ', error);
    }
}
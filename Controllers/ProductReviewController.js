const ProductReview = require('../Models/ProductReviewModel');
const Users = require('../Models/UserModel');
const generatePassword = require('../Utils/generatePassword');
require('dotenv/config');

module.exports.ADD_PRODUCT_REVIEW = async (req, res) => {
    const { productId, rating, review, userId } = req.body;
    try {
        const user = await Users.findById(userId).exec();

        if (user) {
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
        else {
            res.status(404).json({
                message: "User not found!"
            })
        }

    }
    catch (error) {
        console.log('error in add review controller : ', error);
    }
}

module.exports.GET_PRODUCT_REVIEWS_ID = async (req, res) => {
    const productId = req.params.productId;

    try {
        await ProductReview.find({ productId: productId, deleteReview: false })
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

module.exports.ADD_REVIEW_BY_ADMIN = async (req, res) => {
    const { firstName, lastName, email, productId, review, rating } = req.body;
    try {
        const userExist = await Users.findOne({ email: email }).exec();
        if (userExist) {
            res.status(400).json({
                message: "User with this email already exist!"
            })
            return;
        }
        const displayName = email.split('@')[0];
        const user = new Users({
            firstName: firstName,
            lastName: lastName,
            displayName: displayName,
            email: email,
            password: generatePassword()
        }).save();

        user.then((userResponse) => {
            const newReview = new ProductReview({
                userId: userResponse._id,
                productId: productId,
                review: review,
                rating: rating,
                deleteReview: false
            }).save();

            newReview
                .then((reviewResponse) => {
                    if (reviewResponse) {
                        res.status(201).json({
                            message: "Review added successfully!",
                            review: reviewResponse
                        })
                    }
                })
        })

    }
    catch (error) {
        console.log('error in add review by admin controller : ', error);
    }
}

module.exports.GET_ALL_REVIEW = async (req, res) => {
    try {
        const productReviews = await ProductReview.find({ deleteReview: false })
            .populate('userId', '_id firstName lastName displayName email')
            .populate('productId', '_id productName productCompany productImages options').exec();
        res.status(200).json(productReviews);
    }
    catch (error) {
        console.log('error in get all the review controller : ', error);
    }
}

module.exports.DELETE_REVIEW = async (req, res) => {
    const { reviewId } = req.params;
    try {
        const productExist = await ProductReview.findById(reviewId)
            .exec();
        if (!productExist) {
            res.status(404).json({
                message: "Review not found!"
            });
            return;
        }
        await ProductReview.findByIdAndUpdate(reviewId, { deleteReview: true }, { new: true })
            .exec()
            .then((updateResponse) => {
                if (updateResponse) {
                    res.status(200).json({
                        message: "Review deleted successfully"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in delete review controller : ', error);
    }
}
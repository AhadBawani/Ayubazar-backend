const mongoose = require('mongoose');

const ProductReview = new mongoose.Schema(
    {
        productId: {
            required: true,
            type:mongoose.Schema.Types.ObjectId,
            ref: 'Products'
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        rating: {
            type: Number,
            required: true,
        },
        review: {
            type: String,
            required: true
        },
        deleteReview: {
            type: Boolean
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('ProductReview', ProductReview);
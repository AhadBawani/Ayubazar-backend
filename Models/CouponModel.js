const mongoose = require('mongoose');

const CouponModel = new mongoose.Schema(
    {
        coupon: {
            type: String,
            required: true
        },
        percentage: {
            type: Number,
            required: true
        },
        canUse: {
            type: Number,
            required: true
        },
        alreadyUsed: {
            type: Number,
            default:0
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Coupon', CouponModel);
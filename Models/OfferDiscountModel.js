const mongoose = require('mongoose');

const OfferDiscountModel = new mongoose.Schema(
    {
        discountTitle:{
            type:String,            
        },
        discountPercentage:{
            type:Number
        },
        expiryDate:{
            type:Date
        },
        products:{
            type:Array
        },
        expired:{
            type:Boolean
        }
    },
    {
        timestamps:true
    }
)

module.exports = mongoose.model('OfferDiscount', OfferDiscountModel);
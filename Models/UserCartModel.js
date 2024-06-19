const mongoose = require('mongoose');

const UserCartModel = new mongoose.Schema(
    {
        userId:{
            type:String,
            required:true,
            ref:'User'
        },
        productId:{
            type:String,
            required:true,
            ref:'Products'
        },
        option:{
            type:Object
        },
        quantity:{
            type:Number,
            required:true,            
        }
    },
    {

        timestamps:true
    }
)

module.exports = mongoose.model('UserCart', UserCartModel);
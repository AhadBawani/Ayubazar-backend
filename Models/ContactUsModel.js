const mongoose = require('mongoose');

const ContactUsModel = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        phoneNumber:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        state:{
            type:String
        },
        city:{
            type:String
        },
        message:{
            type:String,
            required:true
        }
    },
    {
        timestamps:true
    }
);

module.exports = mongoose.model('ContactUs', ContactUsModel);
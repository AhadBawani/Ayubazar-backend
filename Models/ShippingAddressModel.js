const mongoose = require('mongoose');

const ShippingAddressModel = new mongoose.Schema(
    {
        userId:{
            type:String,
            required:true,
            ref:'User'
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String
        },
        houseNumberAndStreetName: {
            type: String,
            required: true
        },
        apartment: {
            type: String,
        },
        city: {
            type: String,
            required: true
        },
        postcode: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('ShippingAddress', ShippingAddressModel);
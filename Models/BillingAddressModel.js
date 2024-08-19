const mongoose = require('mongoose');

const BillingAddress = new mongoose.Schema(
    {
        userId:{
            type:String,
            ref:'User',
            required:true
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        phoneNumber: {
            type: String
        },
        email: {
            type: String
        },
        streetAddress: {
            type: String,
            required: true
        },
        apartment: {
            type: String
        },
        city: {
            type: String,
            required: true
        },
        postcode:{
            type:String,
            required:true
        },
        state: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('BillingAddress', BillingAddress);
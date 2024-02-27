const mongoose = require('mongoose');

const productsModel = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true
        },
        productImage: {
            type: String,
            required: true
        },
        productCompany: {
            type: String,
            required: true,
            ref: 'Company'
        },
        productCategory:{
            type:String,
            required:true,
            ref:'Category'
        },
        bulletDescription: {
            type: Array,
        },
        discount: {
            type: Number
        },
        description: {
            type: Array
        },
        options: {
            type: Array,
            required: true
        },
        outOfStock: {
            type: Boolean,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Products', productsModel);

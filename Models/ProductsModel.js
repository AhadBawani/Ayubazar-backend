const mongoose = require('mongoose');

const productsModel = new mongoose.Schema(
    {
        ID:{
            type:String
        },
        Type:{
            type:String
        },
        SKU:{
            type:String
        },
        productName: {
            type: String,
            required: true
        },
        productImage: {
            type: String            
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
            required:true
        },
        TaxClass:{
            type:String
        },
        TaxStatus:{
            type:String
        },
        discount: {
            type: Number
        },
        codAvailable:{
            type:Boolean
        },
        description: {
            type: Array,
            required:true
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

const mongoose = require('mongoose');

const productsModel = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true
        },
        productImages: {
            type: [String]
        },
        productCompany: {
            type: String,
            required: true,
            ref: 'Company'
        },
        productCategory: {
            type: String,
            ref: 'Category'
        },
        productSubCategory: {
            type: String,
            ref: 'SubCategory'
        },
        bulletDescription: {
            type: Array,
            required: true
        },
        taxClass: {
            type: String
        },
        taxStatus: {
            type: String
        },
        salesPrice: {
            type: Number
        },
        discount: {
            type: Number
        },
        codAvailable: {
            type: Boolean
        },
        description: {
            type: Array,
            required: true
        },
        options: {
            type: Array,
            required: true
        },
        outOfStock: {
            type: Boolean,
            default: false
        },
        bestSelling: {
            type: Boolean
        },
        delete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Products', productsModel);

const mongoose = require('mongoose');

const CategoryModel = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true,
            ref: 'Company'
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Category', CategoryModel);
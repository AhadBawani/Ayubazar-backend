const mongoose = require('mongoose');

const CategoryModel = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true
        }        
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Category', CategoryModel);
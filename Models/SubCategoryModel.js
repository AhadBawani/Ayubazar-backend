const mongoose = require('mongoose');

const SubCategoryModel = new mongoose.Schema(
     {
          category: {
               type: String,
               required: true,
               ref: 'Category'
          },
          subCategory: {
               type: String
          }
     },
     {
          timestamps: true
     }
);

module.exports = mongoose.model('SubCategory', SubCategoryModel);
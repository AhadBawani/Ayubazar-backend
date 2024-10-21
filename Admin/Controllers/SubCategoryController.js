const SubCategory = require('../../Models/SubCategoryModel');
const Category = require('../../Models/CategoryModel');
const Products = require('../../Models/ProductsModel');

module.exports.ADD_SUB_CATEGORY = async (req, res) => {
     const { category, subCategory } = req.body
     try {
          await Category.findById(category)
               .exec()
               .then((response) => {
                    if (response) {
                         const newSubCategory = new SubCategory({
                              category: category,
                              subCategory: subCategory
                         }).save();

                         newSubCategory.then((response) => {
                              res.status(200).json({
                                   message: "Sub Category added successfully!"
                              })
                         })
                    } else {
                         res.status(404).json({
                              message: "Category not found!"
                         })
                    }
               })
     }
     catch (error) {
          console.log('error in add sub category : ', error);
     }
}

module.exports.GET_ALL_SUB_CATEGORY = async (req, res) => {
     try {
          const arr = [];
          await SubCategory.find({})
               .populate('category')
               .exec()
               .then(async (response) => {
                    for(let i = 0; i < response.length; i++){
                         await Products.find({ productSubCategory:response[i]?._id })
                         .exec()
                         .then((productResponse) => {
                              const obj = {
                                   _id:response[i]?._id,
                                   subCategory:response[i]?.subCategory,
                                   category:response[i]?.category,
                                   products:productResponse,
                                   createdAt:response[i]?.createdAt,
                                   updatedAt:response[i]?.updatedAt
                              }
                              arr.push(obj);
                         })
                    }
                    res.status(200).json(arr);
               })
     }
     catch (error) {
          console.log('error in getting all the sub categories : ', error);
     }
}
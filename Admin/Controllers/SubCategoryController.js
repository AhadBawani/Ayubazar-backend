const SubCategory = require('../../Models/SubCategoryModel');
const Category = require('../../Models/CategoryModel');

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
          await SubCategory.find({})
               .populate('category')
               .exec()
               .then((response) => {
                    res.status(200).json(response);
               })
     }
     catch (error) {
          console.log('error in getting all the sub categories : ', error);
     }
}
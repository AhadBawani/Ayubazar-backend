const Category = require('../../Models/CategoryModel');
const Products = require('../../Models/ProductsModel');
const SubCategories = require('../../Models/SubCategoryModel');

module.exports.ADD_CATEGORY = async (req, res) => {
    const { category } = req.body;
    try {
        await Category.findOne({ category: category })
            .exec()
            .then((categoryResponse) => {
                if (categoryResponse) {
                    res.status(409).send({
                        message: "Category already exists!"
                    })
                }
                else {
                    const newCategory = new Category({
                        category: category
                    }).save();

                    newCategory
                        .then((response) => {
                            res.status(201).json({
                                message: "Category added successfull!",
                                category: {
                                    _id: response._id,
                                    category: response.category
                                }
                            });
                        })
                }
            })
    }
    catch (error) {
        console.log('error in add category controller : ', error);
    }
}

module.exports.EDIT_CATEGORY = async (req, res) => {
    const categoryId = req.params.id;
    const { category, company } = req.body;
    try {
        await Category.findById(categoryId)
            .exec()
            .then(async (categoryResponse) => {
                if (categoryResponse) {
                    await Category.findByIdAndUpdate(categoryId,
                        { category: category, company: company },
                        { new: true })
                        .exec()
                        .then((updateCategoryResponse) => {
                            if (updateCategoryResponse) {
                                res.status(200).json({
                                    message: "Category updated successfully!",
                                    category: {
                                        _id: updateCategoryResponse._id,
                                        category: updateCategoryResponse.category,
                                        company: updateCategoryResponse.company
                                    }
                                })
                            }
                        })
                }
                else {
                    res.status(404).send({
                        message: "Category not found!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in edit category controller : ', error);
    }
}

module.exports.GET_ALL_CATEGORY = async (req, res) => {
    try {
        await Category.find({})
            .then((response) => {
                res.status(200).json(response);
            })
    }
    catch (error) {
        console.log('error in getting all the category : ', error);
    }
}

module.exports.GET_CATEGORY_BY_ID = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const allCategoryProducts = await Products
            .find({ productCategory: categoryId })
            .exec();
        const allSubCategory = await SubCategories
            .find({ category: categoryId })
            .exec();
        const arr = [];
        for (let i = 0; i < allSubCategory.length; i++) {
            const subCategoryProducts = await Products
                .find({ productSubCategory: allSubCategory[i]?._id })
                .exec();

            let obj = {
                subCategory: allSubCategory[i],
                products: subCategoryProducts
            }
            arr.push(obj);
        }
        res.status(200).json({
            products: allCategoryProducts,
            subCategories: arr
        })
    }
    catch (error) {
        console.log('error in getting category by id : ', error);
    }
}
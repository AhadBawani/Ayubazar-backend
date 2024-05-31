const Category = require('../../Models/CategoryModel');
const Company = require('../../Models/CompanyModel');

module.exports.ADD_CATEGORY = async (req, res) => {
    const { category, company } = req.body;
    try {
        await Company.findById(company)
            .exec()
            .then(async (companyResponse) => {
                if (companyResponse) {
                    await Category.findOne({ category: category, company: company })
                        .exec()
                        .then((categoryResponse) => {
                            if (categoryResponse) {
                                res.status(409).send({
                                    message: "Category already exists!"
                                })
                            }
                            else {
                                const newCategory = new Category({
                                    category: category,
                                    company: company
                                }).save();

                                newCategory
                                    .then((response) => {
                                        res.status(201).json({
                                            message: "Category added successfull!",
                                            category: {
                                                _id: response._id,
                                                category: response.category,
                                                company: response.company
                                            }
                                        });
                                    })
                            }
                        })
                }
                else {
                    res.status(404).send({
                        message: "Company not found!"
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
                    await Category.findByIdAndUpdate(categoryId, { category: category, company: company }, { new: true })
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
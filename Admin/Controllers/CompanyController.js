const Company = require('../../Models/CompanyModel');
const Products = require('../../Models/ProductsModel');
const path = require('path');

module.exports.ADD_COMPANY = async (req, res) => {
    const { companyName } = req.body;

    try {
        await Company.findOne({ companyName: companyName })
            .exec()
            .then(async (companyResponse) => {
                if (companyResponse) {
                    res.status(409).send({
                        message: "Company already exists!"
                    })
                }
                else {
                    if (!req.files || Object.keys(req.files).length === 0) {
                        return res.status(400).json({ message: 'No files were uploaded.' });
                    }
                    const companyImage = req.files.companyImage;
                    const uploadPath = path.join(__dirname, '..', '..', 'Images', 'CompanyImages', companyImage.name);
                    await companyImage.mv(uploadPath);

                    const company = new Company({
                        companyName: companyName,
                        companyImage: companyImage.name
                    }).save();

                    company.then(company => {
                        res.status(201).json({
                            message: "company created successfull!",
                            company: {
                                _id: company._id,
                                companyName: company.companyName,
                                companyImage: company.companyImage
                            }
                        });
                    })
                }
            })
    }
    catch (error) {
        console.log('error in add company controller : ', error);
    }
}

module.exports.EDIT_COMPANY = async (req, res) => {
    const companyId = req.params.id;
    const companyName = req.body.companyName;
    try {
        await Company.findById(companyId)
            .exec()
            .then(async (companyResponse) => {
                if (companyResponse) {
                    await Company.findByIdAndUpdate(companyId, { companyName: companyName }, { new: true })
                        .exec()
                        .then((response) => {
                            if (response) {
                                res.status(200).json({
                                    message: "Company edited successfully!",
                                    _id: response._id,
                                    companyName: response.companyName
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
        console.log('error in edit company controller : ', error);
    }
}

module.exports.GET_ALL_COMPANY = async (req, res) => {
    const companies = await Company.find().exec();
    const companyList = [];
    try {
        for (const company of companies) {
            const products = await Products.find({ productCompany: company._id });
            const parsedProducts = products.map((product) => ({
                _id: product._id,
                productName: product.productName,
                options: product.options,
            }));

            companyList.push({
                _id: company._id,
                companyName: company.companyName,
                products: parsedProducts,
            });
        }

        res.status(200).json(companyList);
    }
    catch (error) {
        console.log('error in get all company controller : ', error);
    }
}
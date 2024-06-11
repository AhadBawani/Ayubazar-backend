const Company = require('../../Models/CompanyModel');
const Products = require('../../Models/ProductsModel');
const Categories = require('../../Models/CategoryModel');
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

    try {
        const companyResponse = await Company.findById(companyId);

        if (!companyResponse) {
            return res.status(404).json({ message: "Company not found!" });
        }

        const { companyName } = req.body;

        if (req.files) {            
            const companyImage = req.files.companyImage;            
            const uploadPath = path.join(__dirname, '..', '..', 'Images', 'CompanyImages', companyImage.name);
            await companyImage.mv(uploadPath);
            companyResponse.companyImage = companyImage.name
        }
        companyResponse.companyName = companyName;
        const updateResponse = companyResponse.save();

        res.status(200).json({
            message: "Company updated successfully!",
            company: updateResponse
        });
    }
    catch (error) {
        console.log('error in edit company controller : ', error);
    }
}

module.exports.GET_ALL_ONLY_COMPANIES = async (req, res) => {
    try {
        const companies = await Company.find().exec();
        res.status(200).json(companies);
    }
    catch (error) {
        console.log('error in getting all the companies only controller : ', error);
    }
}

module.exports.GET_ALL_COMPANY = async (req, res) => {
    const companies = await Company.find().exec();
    const companyList = [];
    try {
        for (const company of companies) {
            const products = await Products.find({ productCompany: company._id, productImages: { $ne: [] } });
            if (products.length > 0) {
                const categories = await Categories.find({ company: company._id });
                companyList.push({
                    _id: company._id,
                    companyName: company.companyName,
                    companyImage: company.companyImage,
                    products: products,
                    categories: categories
                });
            }
        }

        res.status(200).json(companyList);
    }
    catch (error) {
        console.log('error in get all company controller : ', error);
    }
}
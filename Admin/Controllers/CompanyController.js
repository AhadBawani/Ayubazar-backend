const Company = require('../../Models/CompanyModel');


module.exports.ADD_COMPANY = async (req, res) => {
    const { companyName } = req.body;

    try {
        await Company.findOne({ companyName: companyName })
            .exec()
            .then((companyResponse) => {
                if (companyResponse) {
                    res.status(409).send({
                        message: "Company already exists!"
                    })
                }
                else {
                    const company = new Company({
                        companyName: companyName,
                        companyImage: req.file.filename
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
    try {
        await Company.find()
            .exec()
            .then((response) => {
                res.status(200).json(response);
            })
    }
    catch (error) {
        console.log('error in get all company controller : ', error);
    }
}
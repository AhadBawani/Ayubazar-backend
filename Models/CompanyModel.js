const mongoose = require('mongoose');

const CompanyModel = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true
        },
        companyImage: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Company', CompanyModel);
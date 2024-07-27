const mongoose = require('mongoose');

const CompanyModel = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true
        },
        companyImage: {
            type: String            
        },
        gstNumber:{
            type:String
        },
        address:{
            type:String
        },
        city:{
            type:String
        },
        pincode:{
            type:String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Company', CompanyModel);
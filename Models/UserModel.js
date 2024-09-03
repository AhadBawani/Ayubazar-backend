const mongoose = require('mongoose');

const UserModel = new mongoose.Schema(
    {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        displayName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        type:{
            type:String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', UserModel);
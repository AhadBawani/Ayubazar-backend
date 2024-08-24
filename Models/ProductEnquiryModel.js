const mongoose = require('mongoose');

const ProductEnquiryModel = new mongoose.Schema(
     {
          name: {
               type: String
          },
          phoneNumber: {
               type: String
          },
          email: {
               type: String
          },
          message: {
               type: String
          },
          delete: {
               type: Boolean,
               default: false
          }
     },
     {
          timestamps: true
     }
);

module.exports = mongoose.model('ProductEnquiry', ProductEnquiryModel);
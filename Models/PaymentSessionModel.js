const mongoose = require('mongoose');

const PaymentSessionModel = new mongoose.Schema(
     {
          orderId: {
               type: String,
               required: true
          },          
          amount: {
               type: Number,
               required: true
          },
          status: {
               type: String,
               required: true
          },
          token: {
               type: String,
               required: true
          }

     },
     {
          timestamps: true
     }
);

module.exports = mongoose.model('PaymentSession', PaymentSessionModel);
const mongoose = require('mongoose');

const OrdersCancelReason = new mongoose.Schema(
     {
          userId:{
               type:String
          },
          orderId:{
               type:String
          },
          message:{
               type:String
          }
     },
     {
          timestamps:true
     }
);

module.exports = mongoose.model('OrdersCancelReason', OrdersCancelReason);
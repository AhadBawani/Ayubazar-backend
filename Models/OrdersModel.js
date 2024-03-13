const mongoose = require('mongoose');

const OrderModel = new mongoose.Schema(
     {
          userId: {
               type: String,
               required: true,
               ref: 'User'
          },
          orderId: {
               type: Number,
               required: true
          },
          products: {
               type: Array,
               required: true
          },
          orderShippingAddress: {
               type: String,
               ref: 'ShippingAddress',
               required: true
          },
          orderBillingAddress: {
               type: String,
               ref: 'BillingAddress',
               required: true
          },
          subTotal: {
               type: Number,
               required: true
          },
          shipping: {
               type: String,
               required: true
          },
          paymentType: {
               type: String,
               required: true
          },
          status: {
               type: String,
               required: true
          },
          cancelOrder: {
               type: String,
               default: null
          },
          total: {
               type: Number,
               required: true
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

module.exports = mongoose.model('Orders', OrderModel);
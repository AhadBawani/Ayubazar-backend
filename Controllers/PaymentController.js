const crypto = require('crypto');
const axios = require('axios');
const OrdersModel = require('../Models/OrdersModel');
const UserCartModel = require('../Models/UserCartModel');
const CouponModel = require('../Models/CouponModel');
require('dotenv/config');
// test API KEY

const MERCHANT_ID = 'AYUBAZARONLINE';
const SALT_KEY = "d7c0fe10-c3b3-48dc-9b79-f5f7be6636f6";

module.exports.CREATE_NEW_PAYMENT = async (req, res) => {
     const { amount, orderId } = req.body;
     try {
          const merchantTransactionId = req.body.transactionId;
          const data = {
               "merchantId": MERCHANT_ID,
               "merchantTransactionId": merchantTransactionId,
               "merchantUserId": "MUID123",
               "amount": amount * 100,
               "redirectUrl": `https://api.ayubazar.in/payment/status/${orderId}`,
               "redirectMode": "POST",
               "callbackUrl":"https://webhook.site/374a8856-4547-4f83-80c5-457a262eab95",
               "mobileNumber":"9428560666",
               "paymentInstrument": {
                    "type": "PAY_PAGE"
               }
          }
          const payload = JSON.stringify(data);
          const payloadMain = Buffer.from(payload).toString('base64');
          const keyIndex = 1;
          const string = payloadMain + '/pg/v1/pay' + SALT_KEY;
          const sha256 = crypto.createHash('sha256').update(string).digest('hex');
          const checksum = sha256 + '###' + keyIndex;
          const prod_URL = "https://api.phonepe.com/apis/hermes";
          const options = {
               method: 'POST',
               url: prod_URL,
               headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum
               },
               data: {
                    request: payloadMain,
               }
          };
          axios.request(options)
               .then(function (response) {
                    return res.status(200).send(response.data.data.instrumentResponse.redirectInfo.url);
               })
               .catch(function (error) {
                    console.log(error);
               });
     } catch (error) {
          res.status(500).send({
               message: error.message,
               success: false
          })
     }
}

module.exports.CHECK_PAYMENT_STATUS = async (req, res) => {
     const orderId = req.params.orderId;
     const merchantTransactionId = res.req.body.transactionId
     const merchantId = res.req.body.merchantId
     const keyIndex = 1;
     const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + SALT_KEY;
     const sha256 = crypto.createHash('sha256').update(string).digest('hex');
     const checksum = sha256 + "###" + keyIndex;
     const options = {
          method: 'GET',
          url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
          headers: {
               accept: 'application/json',
               'Content-Type': 'application/json',
               'X-VERIFY': checksum,
               'X-MERCHANT-ID': `${merchantId}`
          }
     };
     // CHECK PAYMENT TATUS
     axios.request(options)
          .then(async (response) => {
               if (response.data.success === true) {
                    const url = `http://localhost:3000/success/${orderId}`;
                    await OrdersModel.findOne({ orderId: orderId }).exec()
                         .then(async (orderResponse) => {
                              if (orderResponse.status === 'waiting') {
                                   await UserCartModel.deleteMany({ userId: orderResponse.userId }).exec();
                                   // Check if a coupon was used in the order
                                   const couponCode = orderResponse.coupon;
                                   if (couponCode) {
                                        // Find the corresponding coupon in the CouponModel
                                        const coupon = await CouponModel.findById(couponCode).exec();
                                        if (coupon) {
                                             // Update the canUse property of the coupon
                                             let canUse = coupon.canUse - 1;
                                             if (canUse < 0) {
                                                  canUse = 0; // Ensure canUse does not go below 0
                                             }
                                             await CouponModel.findByIdAndUpdate(couponCode, { canUse: canUse }, { new: true }).exec();
                                        }
                                   }
                                   // Update order status to 'Pending'
                                   await OrdersModel.findOneAndUpdate({ orderId: orderId },
                                        { status: 'Pending', paymentType: response.data.data.paymentInstrument.type },
                                        { new: true }).exec();
                              }
                         });
                    return res.redirect(url);
               }
               else {
                    const url = `http://localhost:3000/failure`
                    await OrdersModel.findOne({ orderId: orderId })
                         .exec()
                         .then(async (orderResponse) => {
                              if (orderResponse.status === 'waiting') {
                                   await UserCartModel.deleteMany({ userId: orderResponse.userId }).exec();
                                   await
                                        OrdersModel.findOneAndUpdate
                                             (
                                                  { orderId: orderId },
                                                  { status: 'Cancelled' },
                                                  { new: true }
                                             ).exec();
                              }
                         })
                    return res.redirect(url)
               }
          })
          .catch((error) => {
               console.error(error);
          });
};
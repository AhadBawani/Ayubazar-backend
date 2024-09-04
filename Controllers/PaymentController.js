const crypto = require('crypto');
const axios = require('axios');
const Orders = require('../Models/OrdersModel');
const UserCartModel = require('../Models/UserCartModel');
const Coupons = require('../Models/CouponModel');
const ProductModel = require('../Models/ProductsModel');
const PaymentSession = require('../Models/PaymentSessionModel');
const Users = require('../Models/UserModel');
const ShippingAddress = require('../Models/ShippingAddressModel');
const { transporter } = require('../Utils/transporter');
const generateInvoice = require('../Utils/generateInvoice');
require('dotenv/config');
// test API KEY

const MERCHANT_ID = 'AYUBAZARONLINE';
const SALT_KEY = "d7c0fe10-c3b3-48dc-9b79-f5f7be6636f6";

module.exports.CREATE_NEW_PAYMENT = async (req, res) => {
     const { amount, orderDetail, transactionId } = req.body;
     // const { amount, orderId, transactionId } = req.body;
     try {
          const order = await PlaceOrder(orderDetail);
          const token = crypto.randomBytes(16).toString('hex');
          await PaymentSession
               .findOne({ orderId: order?.orderId })
               .exec()
               .then(async (paymentResponse) => {
                    if (paymentResponse) {
                         res.status(404).json({
                              message: "Invalid request!"
                         })
                    }
                    else {
                         await PaymentSession.create({
                              orderId: order?.orderId,
                              amount: amount,
                              status: 'pending',
                              token: token
                         })
                    }
               });
          const merchantTransactionId = transactionId;
          const data = {
               "merchantId": MERCHANT_ID,
               "merchantTransactionId": merchantTransactionId,
               "merchantUserId": "MUID123",
               "amount": amount * 100,
               "redirectUrl": `https://api.ayubazar.in/payment/status/${order?.orderId}`,
               "redirectMode": "POST",
               "callbackUrl": "https://webhook.site/374a8856-4547-4f83-80c5-457a262eab95",
               "mobileNumber": "9428560666",
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
          const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
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
                    return res.status(200).send({
                         orderId: order?.orderId,
                         token: token,
                         url: response.data.data.instrumentResponse.redirectInfo.url
                    });
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
     console.log('trans : ', res.req.body.transactionId, ' chant : ', res.req.body.merchantId);
     const orderId = parseInt(req.params.orderId);
     const merchantTransactionId = res.req.body.transactionId;
     const merchantId = res.req.body.merchantId;
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
               if (response.data && response.data.code === 'PAYMENT_SUCCESS') {
                    const url = `https://ayubazar.in/success`;
                    // const url = `http://localhost:3000/success`;
                    await Orders.findOne({ orderId: orderId }).exec()
                         .then(async (orderResponse) => {
                              if (orderResponse) {
                                   await UserCartModel.deleteMany({ userId: orderResponse.userId }).exec();
                                   await Orders.findOneAndUpdate({ orderId: orderId },
                                        {
                                             status: 'Pending',
                                             paymentType: response.data?.data?.paymentInstrument?.type
                                        },
                                        { new: true }).exec();
                                   const user = await Users.findById(orderResponse.userId).exec();
                                   const shippingAddress = await ShippingAddress.
                                        findById(orderResponse.orderShippingAddress).exec();
                                   const invoicePdf = await generateInvoice(orderResponse, shippingAddress);
                                   const mailOptions = {
                                        from: 'admin@ayubazar.in',
                                        to: user.email,
                                        subject: 'Order Placed Successfully!',
                                        html: `
                                            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                                                <p>Your order has been placed successfully.</p>
                                                <p>Your order ID is <b>${orderId}</b>.</p>
                                                <p>Current status: <b>${orderResponse?.status}</b>.</p>
                                            </div>
                                        `,
                                        attachments: [
                                             {
                                                  filename: 'invoice.pdf',
                                                  content: invoicePdf,
                                                  contentType: 'application/pdf'
                                             }
                                        ]
                                   };

                                   transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                             console.error('Email sending error:', error);
                                             return res.status(500).json({ message: 'Failed to send email' });
                                        }
                                        console.log('Email sent:', info.response);
                                   });

                                   const adminMailOptions = {
                                        from: 'admin@ayubazar.in',
                                        to: 'admin@ayubazar.in',
                                        subject: `Your order#${orderId} on https://ayubazar.in is successful.`,
                                        html: `
                                                 <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                                                     <p style="font-size: 18px; font-weight: bold;">
                                                            Your order has been placed successfully.
                                                     </p>
                                                     <p>Your order ID is <b>${orderId}</b>.</p>
                                                     <p>Current status: <b>${orderResponse.status}</b>.</p>
                                         
                                                     <!-- Billing Details -->
                                                     <div style="margin-top: 20px;">
                                                         <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                                                             <img src="https://img.icons8.com/ios-filled/24/000000/billing.png" alt="Billing Icon" style="vertical-align: middle; margin-right: 10px;" />
                                                             Billing Details
                                                         </div>
                                                         <p>Name: <b>${user?.firstName} ${user?.lastName}</b></p>                                          
                                                         <p>Email: <b>${user?.email}</b></p>                                          
                                                     </div>
                                         
                                                     <!-- Payment Method -->
                                                     <div style="margin-top: 20px;">
                                                         <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                                                             <img src="" alt="Payment Icon" style="vertical-align: middle; margin-right: 10px;" />
                                                             Payment Method
                                                         </div>
                                                         <p>Pay Mode: <b>Cash on Delivery</b></p>                                          
                                                         <p>Amount: <b>INR ${orderResponse?.total}.00</b></p>
                                                     </div>
                                         
                                                     <!-- Shipping Details -->
                                                     <div style="margin-top: 20px;">
                                                         <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                                                             <img src="https://img.icons8.com/ios-filled/24/000000/shipped.png" alt="Shipping Icon" style="vertical-align: middle; margin-right: 10px;" />
                                                             Shipping Details
                                                         </div>
                                                         <p>Name: <b>${shippingAddress?.firstName} ${shippingAddress?.lastName}</b></p>
                                                         <p>Phone #: <b>${shippingAddress?.phoneNumber}</b></p>
                                                         <p>Address: <b>${shippingAddress?.houseNumberAndStreetName}, ${shippingAddress?.state}, ${shippingAddress?.city}, ${shippingAddress?.postcode}</b></p>
                                                     </div>
                                         
                                                     <!-- Order Amount -->
                                                     <div style="margin-top: 20px;">
                                                         <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                                                             <img src="https://img.icons8.com/ios-filled/24/000000/money.png" alt="Amount Icon" style="vertical-align: middle; margin-right: 10px;" />
                                                             Order Amount
                                                         </div>
                                                         <p>Order Amount: <b>INR ${orderResponse.total}.00</b></p>
                                                         <p>Net Payable: <b>INR ${orderResponse.total}.00</b></p>
                                                     </div>
                                                 </div>
                                             `,
                                        attachments: [
                                             {
                                                  filename: 'invoice.pdf',
                                                  content: invoicePdf,
                                                  contentType: 'application/pdf'
                                             }
                                        ]
                                   };

                                   transporter.sendMail(adminMailOptions, (error, info) => {
                                        if (error) {
                                             console.error('Email sending error:', error);
                                             return res.status(500).json({ message: 'Failed to send email' });
                                        }
                                        console.log('Email sent:', info.response);
                                   });
                              }
                         });
                    return res.redirect(url);
               }
               else {
                    const url = `https://ayubazar.in/payment/failure?redirected=true`;
                    // const url = `http://localhost:3000/payment/failure?redirected=true`;
                    // await Orders.findOne({ orderId: orderId })
                    //      .exec()
                    //      .then(async (orderResponse) => {
                    //           if (orderResponse.status === 'waiting') {
                    //                await UserCartModel.deleteMany({ userId: orderResponse.userId }).exec();
                    //                await
                    //                     OrdersModel.findOneAndUpdate
                    //                          (
                    //                               { orderId: orderId },
                    //                               { status: 'Cancelled' },
                    //                               { new: true }
                    //                          ).exec();
                    //           }
                    //      })
                    console.log('called and redirect : ', url);
                    return res.redirect(url);
               }
          })
          .catch((error) => {
               console.error(error);
          });
};

module.exports.GET_PAYMENT_SESSION_STATUS = async (req, res) => {
     const { orderId, token } = req.params;

     try {
          await PaymentSession
               .findOne({
                    orderId: orderId,
                    token: token
               }).exec()
               .then(async (response) => {
                    if (response) {
                         // const url = `http://localhost:3000/payment/failure?redirected=true`;
                         const url = `https://ayubazar.in/payment/failure?redirected=true`;
                         await PaymentSession.findOneAndUpdate({ orderId: orderId, token: token }, { status: 'expired' }).exec();
                         res.status(200).json({
                              url: url
                         })
                    }

               });
     }
     catch (error) {
          console.log('error in getting payment session status : ', error);
     }
}

module.exports.UPDATE_PAYMENT_STATUS = async (req, res) => {
     const { orderId, token, status } = req.body;

     try {
          await PaymentSession.findOne({ orderId: orderId, token: token, status: 'pending' })
               .exec()
               .then(async (paymentResponse) => {
                    if (paymentResponse) {
                         await PaymentSession.findOneAndUpdate({ orderId: orderId }, { status: status }, { new: true })
                              .exec()
                              .then((updateResponse) => {
                                   res.status(200).json({
                                        message: "updated successfully!"
                                   })
                              })
                    }
                    else {
                         res.status(400).json({
                              message: "Invalid request!"
                         })
                    }
               })
     }
     catch (error) {
          console.log('error in update payment status : ', error);
     }
}

const PlaceOrder = async (orderDetails) => {
     return new Promise(async (resolve, reject) => {
          const { userId, products, orderShippingAddress, status, coupon, handlingCharges,
               codCharges, orderBillingAddress, subTotal, shipping, total, paymentType } = orderDetails;

          const latestOrder = await Orders.findOne({}, {}, { sort: { '_id': -1 } }).exec();
          let orderId;
          if (latestOrder) {
               orderId = parseInt(latestOrder.orderId) + 1;
          } else {
               orderId = 1000;
          }
          // const Products = JSON.parse(products);
          const Products = products;
          // console.log('products : ',Products);
          for (let i = 0; i < Products.length; i++) {
               const product = await ProductModel.findById(Products[i]?.product?._id).exec();
               if (product?.isVariationAvailable) {
                    const existProductOptions = JSON.parse(product.options);
                    const selectedOptions = Products[i].option;
                    const index = existProductOptions
                         .findIndex((item) => item?.option === Object.keys(selectedOptions)[0]);
                    if (index >= 0) {
                         let existObj = existProductOptions[index];
                         if (existObj.quantity < Products[i]?.quantity) {
                              res.status(400).send({
                                   message: "Invalid quantity!"
                              })
                              return;
                         } else {
                              existObj.quantity -= Products[i]?.quantity;
                              existProductOptions[index] = existObj;
                              await ProductModel
                                   .findByIdAndUpdate(Products[i]?.product?._id,
                                        { options: JSON.stringify(existProductOptions) },
                                        { new: true }).exec();
                         }
                    }
               }
          }
          const order = new Orders({
               userId: userId,
               orderId: parseInt(orderId),
               products: products,
               orderShippingAddress: orderShippingAddress,
               orderBillingAddress: orderBillingAddress,
               paymentType: paymentType,
               subTotal: subTotal,
               coupon: coupon,
               shipping: shipping,
               status: status,
               total: total + handlingCharges,
               handlingCharges: handlingCharges,
               codCharges: codCharges
          });

          order
               .save()
               .then(async (orderResponse) => {
                    if (orderResponse) {
                         const couponDoc = await Coupons.findById(coupon);
                         if (couponDoc && couponDoc.canUse > 0) {
                              await Coupons.findByIdAndUpdate(
                                   coupon,
                                   {
                                        $inc: { canUse: -1, alreadyUsed: 1 },
                                   },
                                   { new: true }
                              ).exec();
                         }
                         resolve(orderResponse);
                    }
               })
               .catch((error) => {
                    console.log('error in save order : ', error);
                    reject(error);
               })
     })
}
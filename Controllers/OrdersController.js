const Orders = require('../Models/OrdersModel');
const Coupons = require('../Models/CouponModel');
const ShippingAddress = require('../Models/ShippingAddressModel');
const easyinvoice = require('easyinvoice');
const UserCartModel = require('../Models/UserCartModel');
const ProductModel = require('../Models/ProductsModel');
const Users = require('../Models/UserModel');
const transporter = require('../Utils/transporter');
const generateInvoice = require('../Utils/generateInvoice');
const formatDate = require('../Utils/formatDate');

module.exports.PLACE_ORDER = async (req, res) => {
     const { userId, products, orderShippingAddress, status, coupon, handlingCharges,
          codCharges, orderBillingAddress, subTotal, shipping, total, paymentType } = req.body;

     try {
          const latestOrder = await Orders.findOne({}, {}, { sort: { '_id': -1 } }).exec();
          let orderId;
          if (latestOrder) {
               orderId = parseInt(latestOrder.orderId) + 1;
          } else {
               orderId = 1000;
          }
          const Products = JSON.parse(products);
          for (let i = 0; i < Products.length; i++) {
               const product = await ProductModel.findById(Products[i]?.product?._id).exec();
               if (product.isVariationAvailable) {
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

          await order
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

                         const user = await Users.findById(userId).exec();
                         const shippingAddress = await ShippingAddress.
                              findById(orderResponse.orderShippingAddress).exec();
                         const invoicePdf = await generateInvoice(order, shippingAddress);
                         const mailOptions = {
                              from: 'admin@ayubazar.in',
                              to: user.email,
                              subject: 'Order Placed Successfully!',
                              html: `
                                 <p>Your order has been placed successfully.</p>
                                 <p>Your order ID is <b>${orderId}</b>.</p>
                                 <p>Current status: <b>${status}</b>.</p>
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
                              subject: 'Order Has Been Placed!',
                              html: `
                                 <p>A order has been placed.</p>
                                 <p>And order ID is <b>${orderId}</b>.</p>
                                 <p>Current status: <b>${status}</b>.</p>
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
                         await UserCartModel.deleteMany({ userId: userId }).exec();
                         res.status(200).json({
                              message: "Order placed successfully!",
                              order: {
                                   userId: orderResponse?.userId,
                                   orderId: orderResponse?.orderId,
                                   paymentType: orderResponse?.paymentType,
                                   createdAt: orderResponse?.createdAt,
                                   total: orderResponse?.total
                              }
                         });
                    }
               });
     } catch (error) {
          console.log('Error in place order controller:', error);
          res.status(500).json({ error: 'Internal server error' });
     }
}

module.exports.GET_USER_ORDERS = async (req, res) => {
     const userId = req.params.userId;
     try {
          await Orders.find({ userId: userId, delete: false })
               .populate('orderShippingAddress')
               .populate('orderBillingAddress')
               .populate('coupon')
               .exec()
               .then((orderResponse) => {
                    res.status(200).json(orderResponse);
               })
     }
     catch (error) {
          console.log('error in getting user orders : ', error);
     }
}

module.exports.GET_ORDER = async (req, res) => {
     const { userId, orderId } = req.params;
     try {
          await Orders.findOne({ userId: userId, orderId: orderId })
               .populate('orderBillingAddress')
               .populate('orderShippingAddress')
               .populate('coupon')
               .exec()
               .then((orderResponse) => {
                    if (orderResponse) {
                         res.status(200).json(orderResponse);
                    }
               })
     }
     catch (error) {
          console.log('error in get order controller : ', error);
     }
}

module.exports.DOWNLOAD_ORDER_INVOICE = async (req, res) => {
     const userId = req.body.userId;
     const orderId = req.params.orderId;
     try {
          await Orders.findOne({ orderId: orderId })
               .populate('orderShippingAddress')
               .populate('orderShippingAddress')
               .exec()
               .then(async (orderResponse) => {
                    if (orderResponse) {
                         if (orderResponse.userId === userId) {
                              const invoicePdf = await generateInvoice(orderResponse, orderResponse.orderShippingAddress);

                              console.log('called');
                              res.writeHead(200, {
                                   'Content-Type': 'application/pdf',
                                   'Content-Disposition': `attachment; filename=invoice-${orderId}.pdf`,
                              });
                              res.end(invoicePdf);
                         }
                    } else {
                         res.status(400).json({
                              message: "Invalid request!"
                         })
                    }
               })
     }
     catch (error) {
          console.log('error in downloading order invoice controller : ', error);
     }
}

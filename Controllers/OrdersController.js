const Orders = require('../Models/OrdersModel');
const Coupons = require('../Models/CouponModel');
const ShippingAddress = require('../Models/ShippingAddressModel');
const UserCartModel = require('../Models/UserCartModel');
const ProductModel = require('../Models/ProductsModel');
const Users = require('../Models/UserModel');
const transporter = require('../Utils/transporter');
const generateInvoice = require('../Utils/generateInvoice');

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
                              from: 'admin@ayubazar.com',
                              to: user.email,
                              subject: 'Order Placed Successfully!',
                              html: `
                                  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                                      <p>Your order has been placed successfully.</p>
                                      <p>Your order ID is <b>${orderId}</b>.</p>
                                      <p>Current status: <b>${status}</b>.</p>                                                               
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
                              from: 'admin@ayubazar.com',
                              to: 'admin@ayubazar.com',
                              subject: `Your order#${orderId} on https://ayubazar.in is successful.`,
                              html: `
                                  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                                      <p style="font-size: 18px; font-weight: bold;">
                                             Your order has been placed successfully.
                                      </p>
                                      <p>Your order ID is <b>${orderId}</b>.</p>
                                      <p>Current status: <b>${status}</b>.</p>
                          
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

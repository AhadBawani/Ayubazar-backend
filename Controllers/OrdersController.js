const Orders = require('../Models/OrdersModel');
const easyinvoice = require('easyinvoice');
const UserCartModel = require('../Models/UserCartModel');
const ProductModel = require('../Models/ProductsModel');

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
               total: total + codCharges + handlingCharges,
               handlingCharges: handlingCharges,
               codCharges: codCharges
          });
          await UserCartModel.deleteMany({ userId: userId }).exec();
          await order
               .save()
               .then((orderResponse) => {
                    if (orderResponse) {
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
                              const products = JSON.parse(orderResponse.products);
                              var data = {
                                   apiKey: "free", // Please register to receive a production apiKey: https://app.budgetinvoice.com/register
                                   mode: "development", // Production or development, defaults to production   
                                   images: {
                                        // The logo on top of your invoice
                                        logo: "https://ayubazar.com/wp-content/uploads/2021/04/Final-Logo-250x64.png",
                                   },
                                   // Your own data
                                   sender: {
                                        company: "Ayubazar",
                                        address: "01, Opera Tower Jawahar Road",
                                        zip: "360001",
                                        city: "Rajkot",
                                        country: "Gujarat"
                                   },
                                   // Your recipient
                                   client: {
                                        company: `${orderResponse.orderShippingAddress.firstName} ${orderResponse.orderShippingAddress.lastName}`,
                                        address: `${orderResponse.orderShippingAddress.apartment}, ${orderResponse.orderShippingAddress.houseNumberAndStreetName}`,
                                        zip: `${orderResponse.orderShippingAddress.postcode}`,
                                        city: `${orderResponse.orderShippingAddress.city}`,
                                        country: "India"
                                   },
                                   information: {
                                        number: `AYU-${orderResponse.orderId}`,
                                        date: `${formatDate(orderResponse.createdAt)}`,
                                   },
                                   products: products.map(product => ({
                                        quantity: product.quantity,
                                        description: product.product.productName,
                                        taxRate: 6, // Set the tax rate accordingly
                                        price: Object.values(product?.option)
                                   })),
                                   // The message you would like to display on the bottom of your invoice                                   
                                   settings: {
                                        currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.                                        
                                   }
                              };
                              const result = await easyinvoice.createInvoice(data);
                              const pdfBuffer = Buffer.from(result.pdf, 'base64');

                              res.writeHead(200, {
                                   'Content-Type': 'application/pdf',
                                   'Content-Disposition': `attachment; filename=invoice_${orderId}.pdf`,
                                   'Content-Length': pdfBuffer.length
                              });
                              res.end(pdfBuffer);
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

const formatDate = (date) => {
     const currentDate = new Date(date);
     const monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
     ];

     const monthName = monthNames[currentDate.getMonth()];

     const day = currentDate.getDate();

     const year = currentDate.getFullYear();

     return `${monthName} ${day}, ${year}`;
}
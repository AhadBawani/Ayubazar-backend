const Orders = require('../Models/OrdersModel');
const UserCartModel = require('../Models/UserCartModel');

module.exports.PLACE_ORDER = async (req, res) => {
     const { userId, products, orderShippingAddress, status,
          orderBillingAddress, subTotal, shipping, total, paymentType } = req.body;

     try {
          const latestOrder = await Orders.findOne({}, {}, { sort: { '_id': -1 } }).exec();

          let orderId;
          if (latestOrder) {
               orderId = parseInt(latestOrder.orderId) + 1;
          } else {
               orderId = 1000;
          }
          const order = new Orders({
               userId: userId,
               orderId: parseInt(orderId),
               products: products,
               orderShippingAddress: orderShippingAddress,
               orderBillingAddress: orderBillingAddress,
               paymentType: paymentType,
               subTotal: subTotal,
               shipping: shipping,
               status: status,
               total: total
          });
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

module.exports.REQUEST_FOR_CANCEL = async (req, res) => {
     const orderId = req.params.orderId;
     try {
          await Orders.findByIdAndUpdate(orderId, { status: 'request-for-cancel' }, { new: true })
               .exec()
               .then((orderResponse) => {
                    if (orderResponse) {
                         res.status(200).json({
                              message: "Request sended successfully!",
                              response: orderResponse
                         })
                    }
               })
     }
     catch (error) {
          console.log('error in order request cancel : ', error);
     }
}

module.exports.GET_ORDER = async (req, res) => {
     const { userId, orderId } = req.params;
     try {
          await Orders.findOne({ userId: userId, orderId: orderId })
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

module.exports.GET_ORDER_BY_ID = async (req, res) => {
     const { userId, orderId } = req.params;
     try {
          await Orders.findOne({ userId: userId, orderId: orderId })
               .exec()
               .then((orderResponse) => {
                    if (orderResponse.status === 'waiting') {
                         res.status(200).json(orderResponse);
                    }
               })
     }
     catch (error) {
          console.log('error in getting order detail by ID : ', error);
     }
}

module.exports.UPDATE_ORDER = async (req, res) => {
     const { orderId, userId, status } = req.body;
     try {
          await Orders.findOne({ orderId: orderId })
               .exec()
               .then(async (orderResponse) => {
                    if (orderResponse.status === 'waiting') {
                         await UserCartModel.deleteMany({ userId: userId }).exec();
                         await Orders.findOneAndUpdate({ orderId: orderId }, { status: status }, { new: true })
                              .exec()
                              .then((response) => {
                                   res.status(200).json({
                                        message: "Updated successfully!",
                                        order: response
                                   })
                              })
                    }
               })
     }
     catch (error) {
          console.log('error in update order controller : ', error);
     }
}
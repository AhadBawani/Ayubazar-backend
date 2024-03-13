const Orders = require('../Models/OrdersModel');
const UserCartModel = require('../Models/UserCartModel');

module.exports.PLACE_ORDER = async (req, res) => {
     const { orderId, userId, products, orderShippingAddress,
          orderBillingAddress, subTotal, shipping, total, paymentType } = req.body;

     try {
          const order = new Orders({
               userId: userId,
               orderId: parseInt(orderId),
               products: products,
               orderShippingAddress: orderShippingAddress,
               orderBillingAddress: orderBillingAddress,
               paymentType: paymentType,
               subTotal: subTotal,
               shipping: shipping,
               status: 'Pending',
               total: total
          });
          await order.save();

          await UserCartModel.deleteMany({ userId: userId }).exec();

          res.status(200).json({
               message: "Order placed successfully!",
               orderId: orderId
          });
     } catch (error) {
          console.log('Error in place order controller:', error);
          res.status(500).json({ error: 'Internal server error' });
     }
}

module.exports.GET_ORDER_ID = async (req, res) => {
     try {
          await Orders.findOne({}, {}, { sort: { '_id': -1 } })
               .exec()
               .then((orderResponse) => {
                    if (orderResponse) {
                         res.status(200).send({
                              orderId: parseInt(parseInt(orderResponse.orderId) + 1)
                         })
                    } else {
                         res.status(200).send({
                              orderId: 1000
                         })
                    }
               })
     }
     catch (error) {
          console.log('error in getting order ID : ', error);
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
const Orders = require('../../Models/OrdersModel');
const OrderCancelReason = require('../../Models/OrdersCancelReasonModel');

module.exports.ADD_ORDER_CANCEL_REASON = async (req, res) => {
     const { userId, orderId, message } = req.body;     
     try {
          await Orders.findOne({ orderId: orderId, userId: userId })
               .exec()
               .then(async (orderResponse) => {
                    if (orderResponse) {
                         const orderCancelReason = new OrderCancelReason({
                              userId: userId,
                              orderId: orderId,
                              message: message
                         }).save();

                         await Orders.findOneAndUpdate({ orderId: orderId }, { status: 'request-for-cancel' }, { new: true });

                         orderCancelReason
                              .then((response) => {
                                   res.status(201).json({
                                        message: "Order cancel request sended successfully!"
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
          console.log('error in add order cancel reason : ', error);
     }
}
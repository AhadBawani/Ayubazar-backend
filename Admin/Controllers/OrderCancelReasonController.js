const Orders = require('../../Models/OrdersModel');
const OrderCancelReason = require('../../Models/OrdersCancelReasonModel');
const transporter = require('../../Utils/transporter');

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
                         const mailOptions = {
                              from: 'ahadbawani123@gmail.com',
                              to: 'mohammed.tajani52@gmail.com',
                              subject: 'Request For Order Cancellation!',
                              html: `
                                 <p>A request for order cancellation has arrived for order ID : <b>${orderId}</b>.</p>                                 
                                 <p>Reason for cancellation : <b>${message}</b>.</p>                                 
                             `
                         };
                         transporter.sendMail(mailOptions, (error, info) => {
                              if (error) {
                                   console.error('Email sending error:', error);
                                   return res.status(500).json({ message: 'Failed to send email' });
                              }
                              console.log('Email sent:', info.response);
                         });
                         orderCancelReason
                              .then((response) => {
                                   if (response) {

                                        res.status(201).json({
                                             message: "Order cancel request sended successfully!"
                                        })
                                   }
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

module.exports.GET_ORDER_BY_REASON_BY_ID = async (req, res) => {
     const orderId = req.params.orderId;
     try {
          await OrderCancelReason.findOne({ orderId: orderId })
               .exec()
               .then((orderCancelReasonResponse) => {
                    if (orderCancelReasonResponse) {
                         res.status(200).json(orderCancelReasonResponse);
                    }
               })
     }
     catch (error) {
          console.log('error in getting reason for order id controller : ', error);
     }
}
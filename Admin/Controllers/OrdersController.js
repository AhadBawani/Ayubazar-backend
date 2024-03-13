const Orders = require('../../Models/OrdersModel');
const ExcelJS = require('exceljs');

module.exports.GET_ALL_ORDERS = async (req, res) => {
     try {
          await Orders.find({ status: 'Pending', cancelOrder: null, delete: false })
               .populate('userId')
               .populate('orderShippingAddress')
               .populate('orderBillingAddress')
               .exec()
               .then((orderResponse) => {
                    res.status(200).json(orderResponse);
               })
     }
     catch (error) {
          console.log('error in getting all orders : ', error);
     }
}

module.exports.ORDER_READY_FOR_DELIVER = async (req, res) => {
     const orderId = req.params.orderId;
     try {
          await Orders.findByIdAndUpdate(orderId, { status: 'on-the-way' }, { new: 'true' })
               .exec()
               .then((orderResponse) => {
                    if (orderResponse) {
                         res.status(200).json({
                              message: "Status updated successfully!"
                         })
                    }
               })
     }
     catch (error) {
          console.log('error in order ready for deliver controller : ', error);
     }
}

module.exports.DELETE_ORDER = async (req, res) => {
     const orderId = req.params.orderId;
     try {
          await Orders.findByIdAndUpdate(orderId, { delete: true }, { new: true })
               .exec()
               .then((orderResponse) => {
                    if (orderResponse) {
                         res.status(200).json({
                              message: "Order deleted successfully!",
                              response: orderResponse
                         })
                    }
               })
     }
     catch (error) {
          console.log('error in delete order controller : ', error);
     }
}

module.exports.GET_CANCEL_REQUEST_ORDERS = async (req, res) => {
     try {
          await Orders.find({ status: 'request-for-cancel', delete: false })
               .populate('userId')
               .populate('orderShippingAddress')
               .populate('orderBillingAddress')
               .exec()
               .then((response) => {
                    if (response) {
                         res.status(200).json(response);
                    }
               })
     }
     catch (error) {
          console.log('error in getting cancel request orders : ', error);
     }
}

module.exports.GET_ON_THE_WAY_ORDERS = async (req, res) => {
     try {
          await Orders.find({ delete: false, status: 'on-the-way', cancelOrder: null })
               .populate('userId')
               .populate('orderShippingAddress')
               .populate('orderBillingAddress')
               .exec()
               .then((response) => {
                    if (response) {
                         res.status(200).json(response);
                    }
               })
     }
     catch (error) {
          console.log('error in getting cancel request orders : ', error);
     }
}

module.exports.ACCEPT_CANCEL_ORDER = async (req, res) => {
     const orderId = req.params.orderId;
     try {
          await Orders.findByIdAndUpdate(orderId, { cancelOrder: 'Accepted', status: 'Cancelled' }, { new: true })
               .exec()
               .then((response) => {
                    if (response) {
                         res.status(200).json({
                              message: "Order Cancelled successfully!",
                              response: response
                         })
                    }
               })
     }
     catch (error) {
          console.log('error in accept cancel order controller : ', error);
     }
}

module.exports.REJECT_CANCEL_ORDER = async (req, res) => {
     const orderId = req.params.orderId;
     try {
          await Orders.findByIdAndUpdate(orderId, { cancelOrder: 'Rejected', status: 'Pending' }, { new: true })
               .exec()
               .then((response) => {
                    if (response) {
                         res.status(200).json({
                              message: "Cancel Request Rejected successfully!",
                              response: response
                         })
                    }
               })
     }
     catch (error) {
          console.log('error in accept cancel order controller : ', error);
     }
}

module.exports.ORDER_DELIVERED = async (req, res) => {
     const orderId = req.params.orderId;
     try {
          await Orders.findById(orderId)
               .exec()
               .then(async (orderResponse) => {
                    if (orderResponse.status === 'on-the-way') {
                         await Orders.findByIdAndUpdate(orderId, { status: 'Delivered' }, { new: true })
                              .exec()
                              .then((response) => {
                                   res.status(200).json(response);
                              })
                    }
               })
     } catch (error) {

     }
}

module.exports.ORDER_EXCEL_DETAILS = async (req, res) => {
     try {
          // Query the database to find the first and last orderId
          const minMaxOrderIds = await Orders.aggregate([
               { $group: { _id: null, minOrderId: { $min: "$orderId" }, maxOrderId: { $max: "$orderId" } } }
          ]);

          // Extract min and max orderId from the result
          const minOrderId = minMaxOrderIds[0].minOrderId;
          const maxOrderId = minMaxOrderIds[0].maxOrderId;

          // Generate an array of orderIds within the range
          const orderIdsInRange = Array.from({ length: maxOrderId - minOrderId + 1 }, (_, index) => minOrderId + index);

          // Send the orderIds within the specified range as a response
          res.json(orderIdsInRange);

     } catch (error) {
          console.log('Error in retrieving order details:', error);
          return res.status(500).json({ error: "Internal server error" });
     }
};

module.exports.GET_ORDER_DETAIL_IN_EXCEL = async (req, res) => {
     const { from, to } = req.params;

     const fromOrderId = parseInt(from);
     const toOrderId = parseInt(to);

     if (fromOrderId > toOrderId) {
          return res.status(400).json({ error: "'from' cannot be greater than 'to'" });
     }

     try {
          const minMaxOrderIds = await Orders.aggregate([
               { $group: { _id: null, minOrderId: { $min: "$orderId" }, maxOrderId: { $max: "$orderId" } } }
          ]);
          const minOrderId = minMaxOrderIds[0].minOrderId;
          const maxOrderId = minMaxOrderIds[0].maxOrderId;

          if (fromOrderId < minOrderId || toOrderId > maxOrderId) {
               return res.status(400).json({ error: "Invalid order ID range" });
          }

          const orders = await Orders.find({ orderId: { $gte: fromOrderId, $lte: toOrderId } })
               .populate('userId', 'firstName lastName email')
               .populate('orderShippingAddress', 'houseNumberAndStreetName apartment city postcode state phoneNumber')
               .populate('orderBillingAddress', 'streetAddress apartment city postcode state phoneNumber')
               .exec();

          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Orders');

          // Define columns
          worksheet.columns = [
               { header: 'Order ID', key: 'orderId', width: 15 },
               { header: 'User Name', key: 'userName', width: 20 },
               { header: 'User Email', key: 'userEmail', width: 25 },
               { header: 'Shipping Address', key: 'shippingAddress', width: 50 },
               { header: 'Billing Address', key: 'billingAddress', width: 50 },
               { header: 'Subtotal', key: 'subTotal', width: 15 },
               { header: 'Shipping', key: 'shipping', width: 15 },
               { header: 'Payment Type', key: 'paymentType', width: 15 },
               { header: 'Status', key: 'status', width: 15 },
               { header: 'Cancel Order', key: 'cancelOrder', width: 15 },
               { header: 'Total', key: 'total', width: 15 },
               { header: 'Deleted', key: 'delete', width: 10 }
          ];

          // Add rows
          orders.forEach(order => {
               const shippingAddress = `${order.orderShippingAddress.houseNumberAndStreetName}, ${order.orderShippingAddress.apartment}, ${order.orderShippingAddress.city}, ${order.orderShippingAddress.postcode}, ${order.orderShippingAddress.state}, Phone: ${order.orderShippingAddress.phoneNumber}`;
               const billingAddress = `${order.orderBillingAddress.streetAddress}, ${order.orderBillingAddress.apartment}, ${order.orderBillingAddress.city}, ${order.orderBillingAddress.postcode}, ${order.orderBillingAddress.state}, Phone: ${order.orderBillingAddress.phoneNumber}`;

               worksheet.addRow({
                    orderId: order.orderId,
                    userName: `${order.userId.firstName} ${order.userId.lastName}`,
                    userEmail: order.userId.email,
                    shippingAddress,
                    billingAddress,
                    subTotal: order.subTotal,
                    shipping: order.shipping,
                    paymentType: order.paymentType,
                    status: order.status,
                    cancelOrder: order.cancelOrder,
                    total: order.total,
                    delete: order.delete ? 'Yes' : 'No'
               });
          });

          // Set response headers
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
          
          await workbook.xlsx.write(res, { responseType: 'blob' });

     } catch (error) {
          console.log('Error in getting order detail in Excel form:', error);
          res.status(500).json({ error: 'Internal Server Error' });
     }
};


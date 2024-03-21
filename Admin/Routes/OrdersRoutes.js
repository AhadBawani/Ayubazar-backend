const express = require('express');
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const { GET_ALL_ORDERS, ORDER_READY_FOR_DELIVER, DELETE_ORDER, GET_CANCEL_REQUEST_ORDERS, GET_ON_THE_WAY_ORDERS, ACCEPT_CANCEL_ORDER, REJECT_CANCEL_ORDER, ORDER_DELIVERED, GET_ORDER_DETAIL_IN_EXCEL, ORDER_EXCEL_DETAILS, GET_MONTHLY_REPORT } = require('../Controllers/OrdersController');
const router = express.Router();

router.get('/', authMiddleware, checkAdmin, GET_ALL_ORDERS);
router.get('/cancel-orders', authMiddleware, checkAdmin, GET_CANCEL_REQUEST_ORDERS);
router.get('/on-the-way-orders', authMiddleware, checkAdmin, GET_ON_THE_WAY_ORDERS);
router.post('/:orderId', authMiddleware, checkAdmin, ORDER_READY_FOR_DELIVER);
router.delete('/delete-order/:orderId', authMiddleware, checkAdmin, DELETE_ORDER);
router.post('/accept-cancel-order/:orderId', authMiddleware, checkAdmin, ACCEPT_CANCEL_ORDER);
router.post('/reject-cancel-order/:orderId', authMiddleware, checkAdmin, REJECT_CANCEL_ORDER);
router.post('/order-delivered/:orderId', authMiddleware, checkAdmin, ORDER_DELIVERED);
router.post('/orders-detail-in-excel/:from/:to', authMiddleware, checkAdmin, GET_ORDER_DETAIL_IN_EXCEL);
router.get('/order-excel-details', authMiddleware, checkAdmin, ORDER_EXCEL_DETAILS);
router.get('/get-monthly-report', authMiddleware, checkAdmin, GET_MONTHLY_REPORT);


module.exports = router;
const express = require('express');
const {
     PLACE_ORDER,
     GET_USER_ORDERS,
     GET_ORDER,
     DOWNLOAD_ORDER_INVOICE,
} = require('../Controllers/OrdersController');
const router = express.Router();

router.post('/place-order', PLACE_ORDER);
router.get('/get-order/:userId/:orderId', GET_ORDER);
router.get('/get-user-order/:userId', GET_USER_ORDERS);
router.post('/order-invoice/:orderId', DOWNLOAD_ORDER_INVOICE);

module.exports = router;
const express = require('express');
const { PLACE_ORDER, GET_ORDER_ID, GET_USER_ORDERS, REQUEST_FOR_CANCEL, GET_ORDER } = require('../Controllers/OrdersController');
const router = express.Router();

router.post('/place-order', PLACE_ORDER);
router.get('/get-order-id', GET_ORDER_ID);
router.get('/get-order/:userId/:orderId', GET_ORDER);
router.get('/get-user-order/:userId', GET_USER_ORDERS);
router.post('/request-for-cancel/:orderId', REQUEST_FOR_CANCEL);

module.exports = router;
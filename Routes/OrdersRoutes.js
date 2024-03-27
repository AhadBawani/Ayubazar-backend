const express = require('express');
const {
     PLACE_ORDER,
     GET_USER_ORDERS,
     REQUEST_FOR_CANCEL,
     GET_ORDER,
     GET_ORDER_BY_ID
} = require('../Controllers/OrdersController');
const router = express.Router();

router.post('/place-order', PLACE_ORDER);
router.get('/get-order/:userId/:orderId', GET_ORDER);
router.get('/get-user-order/:userId', GET_USER_ORDERS);
router.post('/request-for-cancel/:orderId', REQUEST_FOR_CANCEL);
router.get('/get-order-by-id/:userId/:orderId', GET_ORDER_BY_ID);

module.exports = router;
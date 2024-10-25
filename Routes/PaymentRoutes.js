const express = require('express');
const { CREATE_NEW_PAYMENT, CHECK_PAYMENT_STATUS, GET_PAYMENT_SESSION_STATUS, UPDATE_PAYMENT_STATUS } = require('../Controllers/PaymentController');
const router = express();

router.post('/', CREATE_NEW_PAYMENT);
router.put('/update-payment-session', UPDATE_PAYMENT_STATUS);
router.get('/payment-session-status/:token/:orderId', GET_PAYMENT_SESSION_STATUS);
router.post('/status/:orderId', CHECK_PAYMENT_STATUS);

module.exports = router;
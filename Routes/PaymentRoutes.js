const express = require('express');
const { CREATE_NEW_PAYMENT, CHECK_PAYMENT_STATUS } = require('../Controllers/PaymentController');
const router = express();

router.post('/', CREATE_NEW_PAYMENT);
router.post('/status/:orderId', CHECK_PAYMENT_STATUS);

module.exports = router;
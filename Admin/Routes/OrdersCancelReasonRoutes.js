const express = require('express');
const { ADD_ORDER_CANCEL_REASON } = require('../Controllers/OrderCancelReasonController');
const router = express.Router();

router.post('/', ADD_ORDER_CANCEL_REASON);

module.exports = router;
const express = require('express');
const { ADD_ORDER_CANCEL_REASON, GET_ORDER_BY_REASON_BY_ID } = require('../Controllers/OrderCancelReasonController');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
const router = express.Router();

router.post('/', ADD_ORDER_CANCEL_REASON);
router.get('/:orderId', authMiddleware, checkAdmin, GET_ORDER_BY_REASON_BY_ID);

module.exports = router;
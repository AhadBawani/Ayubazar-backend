const express = require('express');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
const { CREATE_OFFER, GET_DISCOUNT_OFFER } = require('../Controllers/OfferDiscountController');
const router = express.Router();

router.post('/create-offer/', authMiddleware, checkAdmin, CREATE_OFFER);
router.get('/', GET_DISCOUNT_OFFER);

module.exports = router;
const express = require('express');
const { VALIDATE_COUPON, GENERATE_COUPON, GET_ALL_COUPONS, EDIT_COUPON, DELETE_COUPON } = require('../Controllers/CouponController');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
const router = express.Router();

router.post('/generate-coupon', authMiddleware, checkAdmin, GENERATE_COUPON);
router.post('/get-all-coupon', authMiddleware, checkAdmin, GET_ALL_COUPONS);
router.put('/edit-coupon/:couponId', authMiddleware, checkAdmin, EDIT_COUPON);
router.delete('/delete-coupon/:couponId', authMiddleware, checkAdmin, DELETE_COUPON);
router.post('/validate-coupon', VALIDATE_COUPON);

module.exports = router;
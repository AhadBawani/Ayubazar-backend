const express = require('express');
const { ADD_PRODUCT_REVIEW, GET_PRODUCT_REVIEWS_ID, ADD_REVIEW_BY_ADMIN, GET_ALL_REVIEW, DELETE_REVIEW } = require('../Controllers/ProductReviewController');
const authMiddleware = require('../Admin/Middlewares/AuthMiddleware');
const checkAdmin = require('../Admin/Middlewares/CheckAdminMiddleware');
const router = express.Router();

router.post('/add-review/', ADD_PRODUCT_REVIEW);
router.post('/add-review-by-admin', authMiddleware, checkAdmin, ADD_REVIEW_BY_ADMIN);
router.get('/get-all-review', authMiddleware, checkAdmin, GET_ALL_REVIEW);
router.get('/product-review/:productId', GET_PRODUCT_REVIEWS_ID);
router.delete('/delete-review/:reviewId', authMiddleware, checkAdmin, DELETE_REVIEW);

module.exports = router;
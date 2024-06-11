const express = require('express');
const { ADD_PRODUCT_REVIEW, GET_PRODUCT_REVIEWS_ID } = require('../Controllers/ProductReviewController');
const router = express.Router();

router.post('/add-review/', ADD_PRODUCT_REVIEW);
router.get('/product-review/:productId', GET_PRODUCT_REVIEWS_ID);

module.exports = router;
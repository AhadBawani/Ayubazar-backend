const express = require('express');
const { ADD_PRODUCT_ENQUIRY } = require('../Controllers/ProductEnquiryController');
const router = express.Router();

router.post('/', ADD_PRODUCT_ENQUIRY);

module.exports = router;
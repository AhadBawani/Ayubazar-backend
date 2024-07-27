const express = require('express');
const { ADD_SHIPPING_ADDRESS } = require('../Controllers/ShippingAddressController');
const router = express.Router();

router.post('/', ADD_SHIPPING_ADDRESS);

module.exports = router;
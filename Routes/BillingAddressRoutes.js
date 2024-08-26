const express = require('express');
const { ADD_BILLINGADDRESS } = require('../Controllers/BillingAddressController');
const router = express.Router();

router.post('/', ADD_BILLINGADDRESS);

module.exports = router;
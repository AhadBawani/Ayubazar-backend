const express = require('express');
const router = express.Router();
const PaytmChecksum = require('../Utils/PaytmChecksum');
const { v4: uuidv4 } = require('uuid');
require('dotenv/config');

router.post('/', (req, res) => {
     const { amount, email } = req.body;     
     const totalAmount = JSON.stringify(amount);
     var paytmParams = {};
     const custID = `CUST_${Date.now()}`;
     paytmParams["MID"] = process.env.MERCHANT_ID;
     paytmParams["WEBSITE"] = process.env.WEBSITE;
     paytmParams["CHANNEL_ID"] = process.env.CHANNEL_ID;
     paytmParams["INDUSTRY_TYPE_ID"] = process.env.INDUSTRY_TYPE;
     paytmParams["ORDER_ID"] = uuidv4();
     paytmParams["CUST_ID"] = custID;
     paytmParams["TXN_AMOUNT"] = totalAmount;
     paytmParams["CALLBACK_URL"] = 'http://localhost:5000/api/callback';
     paytmParams["EMAIL"] = email;
     paytmParams["MOBILE_NO"] = '6352397638';

     var paytmChecksum = PaytmChecksum.generateSignature(paytmParams, process.env.MERCHANT_ID);
     paytmChecksum.then(function (checksum) {
          let payParams = {
               ...paytmParams,
               "CHECKSUMHASH":checksum
          }
          res.status(200).json(payParams);
     }).catch(function (error) {
          console.log(error);
     });
})

module.exports = router;
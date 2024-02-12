const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ADD_PRODUCT, GET_ALL_PRODUCTS, GET_PRODUCT_BY_ID } = require('../Controllers/ProductsController');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./Images/ProductImages");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage });

router.post('/', upload.single('productImage'), ADD_PRODUCT);
router.get('/', GET_ALL_PRODUCTS);
router.get('/:productId', GET_PRODUCT_BY_ID);

module.exports = router;
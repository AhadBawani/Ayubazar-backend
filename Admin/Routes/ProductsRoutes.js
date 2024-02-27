const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ADD_PRODUCT, GET_ALL_PRODUCTS, GET_PRODUCT_BY_ID, ENABLE_PRODUCT, DISABLE_PRODUCT, EDIT_PRODUCT } = require('../Controllers/ProductsController');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
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
router.put('/disable-product/:productId', authMiddleware, checkAdmin, DISABLE_PRODUCT);
router.put('/enable-product/:productId', authMiddleware, checkAdmin, ENABLE_PRODUCT);
router.put('/edit-product/:productId', upload.single('productImage'), EDIT_PRODUCT);

module.exports = router;
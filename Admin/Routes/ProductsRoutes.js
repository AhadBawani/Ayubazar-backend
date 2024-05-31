const express = require('express');
const router = express.Router();
const { ADD_PRODUCT, GET_ALL_PRODUCTS, GET_PRODUCT_BY_ID, ENABLE_PRODUCT,
     DISABLE_PRODUCT, EDIT_PRODUCT, ADD_PRODUCT_THROUGH_EXCEL,
     BEST_SELLING_PRODUCT, GET_BEST_SALING_PRODUCTS } = require('../Controllers/ProductsController');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');

router.post('/', authMiddleware, checkAdmin, ADD_PRODUCT);
router.post('/add-products-through-excel', authMiddleware, checkAdmin, ADD_PRODUCT_THROUGH_EXCEL);
router.get('/', GET_ALL_PRODUCTS);
router.get('/best-selling-products', GET_BEST_SALING_PRODUCTS);
router.get('/:productId', GET_PRODUCT_BY_ID);
router.put('/disable-product/:productId', authMiddleware, checkAdmin, DISABLE_PRODUCT);
router.put('/enable-product/:productId', authMiddleware, checkAdmin, ENABLE_PRODUCT);
router.put('/edit-product/:productId', authMiddleware, checkAdmin, EDIT_PRODUCT);
router.post('/best-selling-product/:productId', authMiddleware, checkAdmin, BEST_SELLING_PRODUCT);

module.exports = router;
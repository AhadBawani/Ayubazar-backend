const express = require('express');
const { ADD_CATEGORY, EDIT_CATEGORY, GET_ALL_CATEGORY, GET_CATEGORY_BY_ID } = require('../Controllers/CategoryController');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
const router = express.Router();

router.post('/', authMiddleware, checkAdmin, ADD_CATEGORY);
router.put('/:id', authMiddleware, checkAdmin, EDIT_CATEGORY);
router.get('/:categoryId', GET_CATEGORY_BY_ID);
router.get('/', GET_ALL_CATEGORY);

module.exports = router;
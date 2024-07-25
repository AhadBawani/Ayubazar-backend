const express = require('express');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
const { ADD_SUB_CATEGORY, GET_ALL_SUB_CATEGORY } = require('../Controllers/SubCategoryController');
const router = express.Router();

router.post('/', authMiddleware, checkAdmin, ADD_SUB_CATEGORY);
router.get('/', authMiddleware, checkAdmin, GET_ALL_SUB_CATEGORY);

module.exports = router;
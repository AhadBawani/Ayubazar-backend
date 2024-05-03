const express = require('express');
const { ADD_COMPANY, EDIT_COMPANY, GET_ALL_COMPANY } = require('../Controllers/CompanyController');
const router = express.Router();
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
const authMiddleware = require('../Middlewares/AuthMiddleware');

router.get('/', GET_ALL_COMPANY);
router.post('/', authMiddleware, checkAdmin, ADD_COMPANY);
router.put('/:id', EDIT_COMPANY);

module.exports = router;
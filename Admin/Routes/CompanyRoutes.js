const express = require('express');
const { ADD_COMPANY, EDIT_COMPANY, GET_ALL_COMPANY, GET_ALL_ONLY_COMPANIES, DELETE_COMPANY } = require('../Controllers/CompanyController');
const router = express.Router();
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
const authMiddleware = require('../Middlewares/AuthMiddleware');

router.get('/', GET_ALL_COMPANY);
router.get('/admin-companies', GET_ALL_ONLY_COMPANIES);
router.post('/', authMiddleware, checkAdmin, ADD_COMPANY);
router.put('/:id', authMiddleware, checkAdmin, EDIT_COMPANY);
router.delete('/:id', authMiddleware, checkAdmin, DELETE_COMPANY);

module.exports = router;
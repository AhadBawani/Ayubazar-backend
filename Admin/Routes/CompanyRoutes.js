const express = require('express');
const { ADD_COMPANY, EDIT_COMPANY, GET_ALL_COMPANY } = require('../Controllers/CompanyController');
const router = express.Router();

router.get('/', GET_ALL_COMPANY);
router.post('/', ADD_COMPANY);
router.put('/:id', EDIT_COMPANY);

module.exports = router;
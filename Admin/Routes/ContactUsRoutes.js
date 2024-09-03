const express = require('express');
const { ADD_CONTACT_US, GET_ALL_CONTACT_US } = require('../Controllers/ContactUsController');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
const router = express.Router();

router.post('/', ADD_CONTACT_US);
router.get('/', authMiddleware, checkAdmin, GET_ALL_CONTACT_US);

module.exports = router;
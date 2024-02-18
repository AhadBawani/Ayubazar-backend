const express = require('express');
const { ADMIN_USER_LOGIN, ADMIN_USER_SIGNUP } = require('../Controllers/AdminUserController');
const router = express.Router();

router.post('/login', ADMIN_USER_LOGIN);
router.post('/signup', ADMIN_USER_SIGNUP);

module.exports = router;
const express = require('express');
const { ADMIN_USER_LOGIN, ADMIN_USER_SIGNUP, VALIDATE_USER } = require('../Controllers/AdminUserController');
const router = express.Router();

router.post('/login', ADMIN_USER_LOGIN);
router.post('/signup', ADMIN_USER_SIGNUP);
router.post('/validate', VALIDATE_USER);

module.exports = router;
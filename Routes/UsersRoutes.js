const express = require('express');
const { LOGIN_USER, SIGNUP_USER, GET_USER_BY_ID, EDIT_USER, FORGOT_PASSWORD, VERIFY_TOKEN, RESET_PASSWORD } = require('../Controllers/UsersController');
const router = express.Router();

router.post('/login', LOGIN_USER);
router.post('/signup', SIGNUP_USER);
router.get('/:userId', GET_USER_BY_ID);
router.put('/:userId', EDIT_USER);
router.post('/forgot-password', FORGOT_PASSWORD);
router.post('/verify-token/:token', VERIFY_TOKEN);
router.post('/reset-password/:token', RESET_PASSWORD);

module.exports = router;
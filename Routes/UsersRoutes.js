const express = require('express');
const { LOGIN_USER, SIGNUP_USER, GET_USER_BY_ID, EDIT_USER } = require('../Controllers/UsersController');
const router = express.Router();

router.post('/login', LOGIN_USER);
router.post('/signup', SIGNUP_USER);
router.get('/:userId', GET_USER_BY_ID);
router.put('/:userId', EDIT_USER);

module.exports = router;
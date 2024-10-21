const express = require('express');
const { ADD_BLOG, GET_ALL_BLOGS, EDIT_BLOG, DELETE_BLOG } = require('../Controllers/BlogController');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const checkAdmin = require('../Middlewares/CheckAdminMiddleware');
const router = express.Router();


router.post('/add-blog', authMiddleware, checkAdmin, ADD_BLOG);
router.put('/edit-blog/:blogId', authMiddleware, checkAdmin, EDIT_BLOG);
router.delete('/delete-blog/:blogId', authMiddleware, checkAdmin, DELETE_BLOG);
router.get('/', GET_ALL_BLOGS);

module.exports = router;
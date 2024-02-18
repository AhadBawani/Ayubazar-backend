const express = require('express');
const { ADD_CATEGORY, EDIT_CATEGORY } = require('../Controllers/CategoryController');
const router = express.Router();

router.post('/', ADD_CATEGORY);
router.put('/:id', EDIT_CATEGORY)

module.exports = router;
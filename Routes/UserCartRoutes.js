const express = require('express');
const { GET_USER_CART_BY_ID, ADD_CART_QUANTITY, SUBTRACT_CART_QUANTITY, DELETE_USER_CART, ADD_USER_CART } = require('../Controllers/UserCartController');
const router = express.Router();

router.post('/', ADD_USER_CART);
router.get('/:userId', GET_USER_CART_BY_ID);
router.post('/add-quantity', ADD_CART_QUANTITY);
router.post('/subtract-quantity', SUBTRACT_CART_QUANTITY);
router.delete('/:cartId', DELETE_USER_CART);

module.exports = router;
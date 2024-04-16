var express = require('express');
var router = express.Router();

//hostname:port/api/v1/users
router.use('/api/v1/users', require('./users'));
//hostname:port/api/v1/auths
router.use('/api/v1/auths', require('./auths'));
//hostname:port/api/v1/brands
router.use('/api/v1/brands', require('./brands'));
//hostname:port/api/v1/categories
router.use('/api/v1/categories', require('./categories'));
//hostname:port/api/v1/products
router.use('/api/v1/products', require('./products'));
//hostname:port/api/v1/carts
router.use('/api/v1/carts', require('./carts'));
//hostname:port/api/v1/orders
router.use('/api/v1/orders', require('./orders'));

module.exports = router;

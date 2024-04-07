var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

//hostname:port/api/v1/users
router.use('/api/v1/users', require('./users'));
//hostname:port/api/v1/auths
router.use('/api/v1/auths', require('./auths'));
//hostname:port/api/v1/brands
router.use('/api/v1/brands', require('./brands'));
//hostname:port/api/v1/categoriess
router.use('/api/v1/categories', require('./categories'));
//hostname:port/api/v1/categoriess
router.use('/api/v1/products', require('./products'));

module.exports = router;

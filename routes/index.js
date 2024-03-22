var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

//hostname:port/users
router.use('/users', require('./users'));
//hostname:port/api/v1/books
router.use('/api/v1/books', require('./books'));
//hostname:port/api/v1/authors
router.use('/api/v1/authors', require('./authors'));

module.exports = router;

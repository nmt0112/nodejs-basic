var express = require('express');
var router = express.Router();

//localhost:8080/users
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/add', function (req, res, next) {
  res.send('respond with a resource add');
});

module.exports = router;

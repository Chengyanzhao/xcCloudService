var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.sendfile('./views/index.html');
});
router.get('/main/*', function (req, res, next) {
  res.sendfile('./views/index.html');
})

module.exports = router;
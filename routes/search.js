var express = require('express');
var router = express.Router();
var basex = require('../db');

/* GET search page. */
router.get('/', function(req, res, next) {
  res.render('search', { title: 'Colenso' });
});

/* GET advance search page */
router.get('/result', function(req, res, next) {
  basex.execute("list", function(err, data) {
    console.log(err);
    console.log(data);
  });
    res.render('result', { title: 'Colenso' });
});

module.exports = router;

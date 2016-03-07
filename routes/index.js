var express = require('express');
var router = express.Router();
var models = require('../models');

/* GET home page. */
router.get('/', function(req, res, next) {
  models.Document.findAll().then(function(docs) {
    res.render('index', { title: 'Colenso', docs: docs });
  });
});

module.exports = router;

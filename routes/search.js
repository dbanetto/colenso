var express = require('express');
var router = express.Router();
var basex = require('../db');
var _ = require('underscore');

/* GET search page. */
router.get('/', function(req, res, next) {
  res.render('search', { title: 'Colenso' });
});

/* GET advance search page */
router.get('/query', function(req, res, next) {
  basex.search(req.query.q,
                function(err,data) {
                  results = _.map(data, function(ele) {
                    return {
                      url: '/browse/' + ele.path.replace(/\.xml$/, '/view'),
                      title: ele.title
                    };
                  });
                  res.render('query', { title: 'Colenso', results: results });
                });
});

module.exports = router;

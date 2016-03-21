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
  if (req.query.q) {
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
  } else if (req.query.xp) {
  basex.searchXPath(req.query.xp,
                function(err,data) {
                  results = _.map(data, function(ele) {
                    return {
                      url: '/browse/' + ele.path.replace(/\.xml$/, '/view'),
                      title: ele.title
                    };
                  });
                  res.render('query', { title: 'Colenso', results: results });
                });
  } else if (req.query.xq) {
  basex.searchXQuery(req.query.xq,
                function(err,data) {
                  if (err) {
                    console.log(err);
                    res.render('query', { title: 'Colenso', xquery: err });
                  } else {
                  res.render('query', { title: 'Colenso', xquery: data.result });
                  }
                });

  }else {
    res.redirect('/search');
  }
  
});

module.exports = router;

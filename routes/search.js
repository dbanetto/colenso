var express = require('express');
var router = express.Router();
var basex = require('../db');
var Zip = require('node-zip');
var _ = require('underscore');

/* GET search page. */
router.get('/', function(req, res, next) {
    res.render('search', { title: 'Colenso - Search' });
});

/* GET advance search page */
router.get('/query', function(req, res, next) {
  if (req.query.q) {
    if (req.query.r) {
      req.query.q = req.query.q + " AND " + req.query.r;
    }
    basex.search(
      req.query.q,
      function(err,data) {
        var docs = [];
        results = _.map(data, function(ele) {
          docs.push(ele.path);
          return {
            url: '/browse/' + ele.path.replace(/\.xml$/, '/view'),
            title: ele.title,
            context: ele.context
          };
        });
        res.render('query', { title: 'Colenso - Search Result',  results: results, docs: docs, query: req.query.q });
      });

  } else if (req.query.xp) {
    basex.searchXPath(
      req.query.xp,
      function(err,data) {
        var docs = [];
        results = _.map(data, function(ele) {
          docs.push(ele.path);
          return {
            url: '/browse/' + ele.path.replace(/\.xml$/, '/view'),
            title: ele.title,
            context: ele.context
          };
        });
        res.render('query', { title: 'Colenso - Search Result', results: results, docs: docs });
      });
  } else if (req.query.xq) {
    basex.searchXQuery(
      req.query.xq,
      function(err,data) {
        if (err) {
          console.log(err);
          res.render('query', { title: 'Colenso - Search Result - Error', xquery: err });
        } else {
          res.render('query', { title: 'Colenso - Search Result', xquery: data.result });
        }
      });

  } else {
    res.redirect('/search');
  }
});


router.post('/download', function(req, res, next) {
  var docs = req.body.docs.split(',');
  var zip = new Zip();
  var progress = 0;
  _.each(docs, function(doc) {
    progress = progress + 1;
    basex.getDocument("/" + doc, function(err, data) {
      if (err) console.log(err);
      zip.file(doc, data);
      progress = progress - 1;
    });
  });

  waitTill(
    function() { return progress === 0; },
    function() {
      var options = {base64: false, compression:'DEFLATE'};
      res.setHeader('Content-disposition', 'attachment; filename=query-results.zip');
      res.setHeader('Content-type', 'application/zip');
      res.write(zip.generate(options), 'binary');
      res.end();
    }, 1000);
});

function waitTill(check, cb, amount) {
  setTimeout(function() {
    if (!check()) {
      waitTill(check, cb, amount);
    } else {
      cb();
    }
  }, amount);
}

module.exports = router;

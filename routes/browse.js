var express = require('express');
var router = express.Router();
var basex = require('../db');
var cheerio = require('cheerio');

/* GET search page. */
router.get('/', function(req, res, next) {
  basex.execute("list", function(err, data) {
    console.log(err);
    console.log(data);
  });
  res.render('browse', { title: 'Colenso' });
});

router.get('/*/view', function(req, res, next) {
  console.log("View:" + req.params);
  res.render('browse', { title: 'Colenso' });
});

// GET all files that are stored using this
router.get('/*', function(req, res, next) {
  basex.execute("XQUERY <result> { for $c in collection('colenso" + req.url + "')\n return <li> { document-uri($c) } </li> } </result> ",
                function(err, data) {
                  if (err) console.log(err);
                  var $ = cheerio.load(data.result);
                  var list = [];
                  $('li').each(function(i, elem) {
                    list[i] = $(this).text();
                  });
                  res.render('browse', { title: 'Colenso', list: list });
                });
});

module.exports = router;

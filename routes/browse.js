var express = require('express');
var router = express.Router();
var basex = require('../db');

/* GET search page. */

router.get('/*/view', function(req, res, next) {
  var url = req.url.replace(/\/view\/?/, '');
  basex.getDocument(url + ".xml", function(err, doc) {
    if (err) console.log(err);
    res.render('view', { title: 'Colenso', doc: doc  });
  });
});

// GET all files that are stored using this
router.get('/*', function(req, res, next) {
  basex.foldersInPath (req.url, function(err, data) {
    if (err) console.log(err);
    res.render('browse', { title: 'Colenso', list: data });
  });
});

module.exports = router;

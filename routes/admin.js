var express = require('express');
var fs = require('fs');
var basex = require('../db');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: '/tmp/' });
var _ = require('underscore');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin', { title: 'Colenso' });
});

router.get('/new', function(req, res, next) {
  res.render('new', { title: 'Colenso' });
});

router.post('/new', upload.single('newDoc'), function(req, res, next) {
  var path = req.body.path;
  fs.readFile(req.file.path, function(err, data) {
    if (err) {
      res.render('new', { title: 'Colenso', error: error });
      return;
    }
    basex.addDocument(path, data, function(err, data) {
      if (err) {
        res.render('new', { title: 'Colenso', error: error });
        return;
      }
      console.log(data);
      fs.unlinkSync(req.file.path);
      res.redirect('/browse' + path.replace(/\.xml$/,'') + '/view');
    });
  });

});

router.get('/history', function(req, res, next) {
  basex.searchHistory(function(err, data) {
    _.each(data, function(ele) {
      switch (ele.type) {
        case "text":
          ele.url = "/search/query?q="+ele.query;
          break;
        case "xpath":
          ele.url = "/search/query?xp="+ele.query;
          break;
        case "xquery":
          ele.url = "/search/query?xq="+ele.query;
          break;
      }
    });
    res.render('history', {title: 'Colenso - Search History', history: data});
  });
});

module.exports = router;

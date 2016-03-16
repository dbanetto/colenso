var express = require('express');
var fs = require('fs');
var basex = require('../db');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: '/tmp/' });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin', { title: 'Colenso' });
});
/* GET home page. */
router.post('/new', upload.single('newDoc'), function(req, res, next) {
  var path = req.body.path;
  fs.readFile(req.file.path, function(err, data) {
    if (err) {
      console.log(err);
      res.render('admin', {err: err});
      return;
    }
    basex.execute('open colenso');

    basex.add(path, data, function(err, data) {
      if (err) {
        console.log(err);
        res.render('admin', {err: err});
        return;
      }
      console.log(data);

      res.render('admin', {result: data, path: path});
    });
  });

});

module.exports = router;

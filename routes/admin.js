var express = require('express');
var fs = require('fs');
var basex = require('../db');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: '/tmp/' });

/* GET home page. */
router.get('/', function(req, res, next) {
  var error = req.session.error;
  req.session.error = undefined;
  res.render('admin', { title: 'Colenso', error: error });
});
/* GET home page. */
router.post('/new', upload.single('newDoc'), function(req, res, next) {
  var path = req.body.path;
  fs.readFile(req.file.path, function(err, data) {
    if (err) {
      console.log(err);
      req.session.error = err;
      res.redirect('/admin');
      return;
    }
    basex.addDocument(path, data, function(err, data) {
      if (err) {
        console.log(err);
        req.session.error = err;
        res.redirect('/admin');
        return;
      }
      console.log(data);
      fs.unlinkSync(req.file.path);
      res.redirect('/browse' + path.replace(/\.xml$/,'') + '/view');
    });
  });

});

module.exports = router;

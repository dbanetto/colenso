var express = require('express');
var router = express.Router();
var basex = require('../db');
var _ = require('underscore');

/* GET search page. */
router.get('/*/view', function(req, res, next) {
  var url = req.url.replace(/\/view\/?/, '');
  basex.getDocument(url + ".xml", function(err, doc) {
    if (err) console.log(err);
    var crumbs = breadcrumbs(req.url.replace(/\/view\/?$/, ''), req.baseUrl);
    crumbs.unshift({title: 'Browse', url: req.baseUrl});
    res.render('view', { title: 'Colenso', doc: doc, crumbs: crumbs, download_url:  req.baseUrl + url + '.xml' });
  });
});

router.get('/*.xml', function(req, res, next) {
  basex.getDocument(req.url, function(err, doc) {
    if (err) console.log(err);
    var name = _.last(req.url.split('/'));
    res.setHeader('Content-disposition', 'attachment; filename=' + name);
    res.setHeader('Content-type', 'text/xml');

    res.write(doc, 'utf-8');
    res.end();
  });
});

// GET all files that are stored using this
router.get('/*', function(req, res, next) {
  basex.foldersInPath (req.url, function(err, data) {
    if (err) console.log(err);
    var list = _.map(data, function(ele) {
      return {
        url: req.originalUrl + '/' + ele.path.replace(/\.xml$/, '/view'),
        title: ele.title,
        glyph: ele.path.indexOf('.xml') > -1 ? 'glyphicon-file' : 'glyphicon-folder-close',
      };});
      var crumbs = breadcrumbs(req.url, req.baseUrl);
      if (req.baseUrl !== req.originalUrl) {
        crumbs.unshift({title: 'Browse', url: req.baseUrl});
      }
      res.render('browse', { title: 'Colenso', list: list, crumbs: crumbs });
  });
});

function breadcrumbs(url, baseUrl) {
  return _.map(_.compact(url.split('/')), function(val, index, list) {
    val = val.replace(/_/g, ' ');
    if (index + 1 == list.length) {
      return val;
    }
    var url = baseUrl;
    for (var i = 0; i <= index; i++) {
      url = url + '/' + list[i];
    }
    return { title: val, url:  url};
  });
}

module.exports = router;

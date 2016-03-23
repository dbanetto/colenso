var express = require('express');
var router = express.Router();
var basex = require('../db');
var cheerio = require('cheerio');
var _ = require('underscore');

/* GET search page. */
router.get('/*/view', function(req, res, next) {
  var url = req.url.replace(/\/view\/?/, '');
  basex.getDocument(url + ".xml", function(err, doc) {
    if (err) console.log(err);
    var crumbs = breadcrumbs(req.url.replace(/\/view\/?$/, ''), req.baseUrl);
    crumbs.unshift({title: 'Browse', url: req.baseUrl});
    res.render('view', { title: 'Colenso', doc: teiToObject(doc), crumbs: crumbs, download_url: req.baseUrl + url + '.xml' });
  });
});

router.get('/*/edit', function(req, res, next) {
  var url = req.url.replace(/\/edit\/?/, '');
  basex.getDocument(url + ".xml", function(err, doc) {
    if (err) console.log(err);
    var crumbs = breadcrumbs(req.url.replace(/\/edit\/?$/, ''), req.baseUrl);
    crumbs.unshift({title: 'Browse', url: req.baseUrl});
    res.render('edit', { title: 'Colenso', doc: doc, crumbs: crumbs, edit_url: req.originalUrl });
  });
});

router.post('/*/edit', function(req, res, next) {
  var url = req.url.replace(/\/edit\/?/, '');
  basex.execute('open colenso', function(err, data) {
    if (err) {
      res.redirect(req.originalUrl);
    }
    basex.execute('REPLACE ' + url.replace(/^\/browse/,'') + '.xml ' + req.body.doc, function (err, data) {
      if (err) {
        res.redirect(req.originalUrl);
      }
      res.redirect(req.baseUrl + url + '/view');
    });
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
      list = list.sort(function(a,b) { return a.title < b.title ? -1 : 1; });
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

function teiToObject(doc) {
  $ = cheerio.load(doc);

  var author = $('<ul>');
  $('titleStmt author name').each(function(i, elem) {
    var item = $('<li>')
    .attr('class', 'authors')
    .append('<span class="glyphicon glyphicon-user" />')
    .append('<span> ' + $(this).text() + '</span>');
    author.append(item);
  });
  console.log(author.html());


  return { 
    title: $('title').text(),
    sourceDesc: $('sourceDesc').html(),
    author: author.html(),
    front: $('text front').text(),
    body: $('text body').html(),
  };
}

module.exports = router;

var basex = require('basex');
var cheerio = require('cheerio');
var _ = require('underscore');

var session = new basex.Session(process.env.BASEX_HOST || 'localhost',
                                process.env.BASEX_PORT || 1984,
                                process.env.BASEX_USER || 'admin',
                                process.env.BASEX_PASS || 'admin');


basex.Session.prototype.search= function(query, cb) {
  var xquery =
    "for $hit in collection('colenso')\n" +
    "where $hit[descendant::text() contains text '" + query + "']\n" +
    "return <li path='{ db:path($hit) }'>{ $hit//*:title }</li>";
  this.execute("XQUERY <result> { " + xquery + " } </result> ",
                function(err, data) {
                  if (err) {
                    cb(err);
                    return;
                  }
                  var $ = cheerio.load(data.result);
                  var list = [];
                  $('li').each(function(i, elem) {
                    list[i] = { title: $(this).text().trim(),
                      path: $(this).attr('path')
                    }
                  });
                  cb(undefined, list);
                });
};

basex.Session.prototype.documentsInFolder = function(path, cb) {
  this.execute("XQUERY <result> { for $c in collection('colenso" + path + "')\n return <li> { db:path($c) } </li> } </result> ",
                function(err, data) {
                  if (err) {
                    cb(err);
                    return;
                  }
                  var $ = cheerio.load(data.result);
                  var list = [];
                  $('li').each(function(i, elem) {
                    list[i] = $(this).text();
                  });
                  cb(undefined, list);
                });
};

basex.Session.prototype.foldersInPath = function(path, cb)  {
  this.documentsInFolder(path, function(err, data) {
    path = path.replace('/', '');
    if (err) {
      cb(err);
      return;
    }
    var list = _.map(data, function(line) {
      line = line.replace(path, '');
      if (line.indexOf('/') > -1) {
        line = line.replace(/^\//, '');
        line = line.replace(/\/.*$/, '');
      }
      return line;
    });

    cb(undefined, _.uniq(list));
  });
};

basex.Session.prototype.getDocument = function(path, cb) {
  this.execute("XQUERY doc('colenso" + path + "')",
                function(err, data) {
                  if (err) {
                    cb(err);
                    return;
                  }
                  cb(undefined, data.result);
                });
};

module.exports = session;

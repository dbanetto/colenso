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
    "where $hit//*:text[descendant::text() contains text '" + query + "']\n" +
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
                    };
                  });
                  cb(undefined, list);
                });
};

basex.Session.prototype.searchXPath = function(query, cb) {
  var xquery =
    "for $hit in collection('colenso')\n" +
    "where $hit" + query + "\n" +
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
                    };
                  });
                  cb(undefined, list);
                });
};

basex.Session.prototype.searchXQuery = function(query, cb) {
  console.log(query);
  this.execute("XQUERY " + query,
                function(err, data) {
                  if (err) {
                    cb(err);
                    console.log(err);
                    return;
                  }
                  cb(undefined, data);
                });
};

basex.Session.prototype.documentsInFolder = function(path, cb) {
  this.execute("XQUERY <result> { for $c in collection('colenso" + path + "')\n return <li path='{ db:path($c) }'>{ $c//*:title }</li> } </result> ",
                function(err, data) {
                  if (err) {
                    cb(err);
                    return;
                  }
                  var $ = cheerio.load(data.result);
                  var list = [];
                  $('li').each(function(i, elem) {
                    list[i] = {
                      title: $(this).text().trim(),
                      path: $(this).attr('path')
                    };
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
      line.path = line.path.replace(path, '');
      if (line.path.indexOf('/') > -1) {
        line.path = line.path.replace(/^\//, '');
        line.path = line.path.replace(/\/.*$/, '');
        if (line.path.indexOf('.xml') < 0) {
          line.title = line.path.replace(/_/g, ' ');
        }
      }
      return line;
    });
    list = _.uniq(list, function (e) { return e.path; });
    cb(undefined, list);
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

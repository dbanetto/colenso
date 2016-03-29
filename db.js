var basex = require('basex');
var cheerio = require('cheerio');
var escape = require('escape-html');
var xml = require('libxmljs');
var _ = require('underscore');

var session = new basex.Session(
  process.env.BASEX_HOST || 'localhost',
  process.env.BASEX_PORT || 1984,
  process.env.BASEX_USER || 'admin',
  process.env.BASEX_PASS || 'admin');


function searchQuerify(search) {
  search = search.replace(/'/, "\\'");
  search = "'" + search + "'";
  search = search.replace(/\s+AND\s+/g, "\' ftand \'");
  search = search.replace(/\s+OR\s+/g, "\' ftor \'");
  search = search.replace(/\s+NOT\s+/g, "\' ftand ftnot \'");
  search = search.replace(/\s+NOR\s+/g, "\' ftor ftnot \'");
  console.log(search);
  return search;
}

basex.Session.prototype.search = function(query, cb) {
  var basex = this;
  var xquery =
    "for $hit score $score in collection('colenso')[. contains text " + searchQuerify(query) + " using wildcards ]\n" +
    "order by $score descending \n" +
    "return <li path='{ db:path($hit) }' title='{ $hit//*:title }'> { $hit//*:titleStmt/*:author/*:name } </li>";
    console.log("xquery:"+ xquery);
    this.execute("XQUERY <result> { " + xquery + " } </result> ",
      function(err, data) {
        if (err) {
          cb(err);
          return;
        }
        basex.searchRecord(query, 'text', function(){});
        var $ = cheerio.load(data.result);
        var list = [];
        $('li').each(function(i, elem) {
          list[i] = {
            title: $(this).attr('title').trim(),
            context: $(this).text().trim() || 'Unknown',
            path: $(this).attr('path')
          };
        });
        cb(undefined, list);
      });
};

basex.Session.prototype.searchXPath = function(query, cb) {
  var basex = this;
  var xquery =
    "for $hit in collection('colenso')\n" +
    "where $hit" + query + "\n" +
    "return <li path='{ db:path($hit) }' title='{ $hit//*:title }'> { $hit" + query + " } </li>";
    this.execute(
      "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';\n <result> { " + xquery + " } </result> ",
      function(err, data) {
        if (err) {
          cb(err);
          return;
        }
        basex.searchRecord(query, 'xpath', function(){});
        var $ = cheerio.load(data.result);
        var list = [];
        $('li').each(function(i, elem) {
          list[i] = { 
            title: $(this).attr('title').trim(),
            context: limitText($(this).text().trim(), 160),
            path: $(this).attr('path')
          };
        });
        cb(undefined, list);
      });
};

basex.Session.prototype.searchXQuery = function(query, cb) {
  var basex = this;
  this.execute(
    "XQUERY " + query,
    function(err, data) {
      if (err) {
        cb(err);
        return;
      }
      basex.searchRecord(query, 'xquery', function(){});
      cb(undefined, data);
    });
};

basex.Session.prototype.documentsInFolder = function(path, cb) {
  this.execute(
    "XQUERY <result> { for $c in collection('colenso" + path + "')\n" +
      "return <li path='{ db:path($c) }'>{ $c//*:title }</li> } </result> ",
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
    path = path.replace(/^\//, '');
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


basex.Session.prototype.addDocument = function(path, contents, cb)  {
  var basex = this;

  try {
    var xmlDoc = xml.parseXmlString(contents);
  } catch(err) {
    cb('Invalid XML');
    return;
  }

  basex.execute('open colenso');
  basex.add(path, contents, function(err, data) {
    if (err) {
      console.log('validate error ' + err);
      cb(err);
      return;
    }
    console.log('added ' + path);
    cb(undefined, data);
  });

};

basex.Session.prototype.getDocument = function(path, cb) {
  this.execute(
    "XQUERY doc('colenso" + path + "')",
    function(err, data) {
      if (err) {
        cb(err);
        return;
      }
      cb(undefined, data.result);
    });
};

basex.Session.prototype.searchHistory = function(cb) {
  var basex = this;
  this.execute('OPEN search', function(err, data) { 
    basex.execute(
      "XQUERY doc('search')",
      function(err, data) {
        console.log(data.result);
        if (err) {
          cb(err);
          return;
        }
        basex.execute('open colenso');
        var $ = cheerio.load(data.result);
        var list = [];
        $('search').each(function(i, elem) {
          list[i] = { 
            type: $(this).attr('type').trim(),
            query: $(this).text().trim()
          };
        });
        
        cb(undefined, list);
      });
  });
};

basex.Session.prototype.searchRecord = function(query, type, cb) {
  this.execute('open search');
  var xquery = 
    "XQUERY " +
    "let $search := <search type='" + type + "'>" + escape(query) + "</search>\n"+
    "return insert node $search as last into doc('search')/root";
  this.execute(
    xquery,
    function(err, data) {
      if (err) {
        cb(err);
        return;
      }
      cb(undefined, data.result);
    });
};

function limitText(str, limit) {
  if (str.length <= limit) { return str; }
  return str.substring(0, limit - 1) + '…';
}

module.exports = session;

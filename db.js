var basex = require('basex');

var session = new basex.Session(process.env.BASEX_HOST || 'localhost',
                                process.env.BASEX_PORT || 1984,
                                process.env.BASEX_USER || 'admin',
                                process.env.BASEX_PASS || 'admin');
module.exports = session;

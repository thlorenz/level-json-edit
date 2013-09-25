'use strict';

var path = require('path');

function isIndex (key) {
  return (/^idx-/).test(key);
}

module.exports = {
    isIndex    :  isIndex
  , dataPrefix :  'data-json'
  , dbPath     :  path.join(__dirname, 'store', 'sample.db')
}

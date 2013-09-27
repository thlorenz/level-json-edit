'use strict';

var path = require('path');

function isIndex (key) {
  return (/^idx-/).test(key);
}

function validate(entry, previous) {
  console.log('validating', entry, previous);
  return true;
}

module.exports = {
    isIndex    :  isIndex
  , valiate    :  validate 
  , dataPrefix :  'data-json'
  , dbPath     :  path.join(__dirname, 'store', 'sample.db')
}

'use strict';
var path      =  require('path')
  , liveStream = require('level-live-stream')

function isIndex (key) {
  return (/^idx-/).test(key);
}

function validate(entry, previous) {
  return true;
}

function mixin (db, indexPrefs) {
  function installLiveStream(pref) {
    var sub = db.sublevel(pref);
    liveStream.install(sub);
  }
  indexPrefs.forEach(installLiveStream);
}

module.exports = {
    isIndex    :  isIndex
  , valiate    :  validate 
  , mixin      :  mixin
  , dataPrefix :  'data-json'
  , dbPath     :  path.join(__dirname, 'store', 'sample.db')
}

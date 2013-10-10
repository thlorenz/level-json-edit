'use strict';

var sublevelIndexes = require('./sublevel-indexes');

module.exports =  function indexRefresher (sublevels, indexesEditor, opts) {
  return function refreshIndexes (cb) {
    sublevelIndexes(sublevels, opts, function (err, indexes) {
      if (err) return cb(err);
      indexesEditor.set(indexes);
      cb();
    })
  }
}

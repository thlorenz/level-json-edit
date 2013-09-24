'use strict';

var dump = require('level-dump')
  , asyncReduce = require('asyncreduce')

/**
 * Reads all index sublevel entries and indexes them by sublevel-prefix.index-value
 *
 * Example: 
 *  sublevel with prefix 'idx-foo' and keys 'beep~one-beep', 'beep~two-beep', 'boop~one-boop' its keys indexed as:
 *    { 'idx-foo': {
 *        'beep': [ 'beep-one', beep-two value' ]
 *        'boop': [ 'boop-one' ]
 *      }
 *    }
 * 
 * @name exports
 * @function
 * @param sublevels {LevelDB} sublevels
 * @param isIndex {Function} should return true if prefix is for a sublevel that is an index, otherwise false
 * @param cb {Function} called with an error and/or the indexes
 */
var go = module.exports = function (sublevels, isIndex, cb) {

  var indexSublevels = Object.keys(sublevels)
    .filter(isIndex)
    .map(function (k) { return sublevels[k] })

  function createSearch (acc, sublevel, cb) {
    var sep = sublevel._sep;
    var index = acc[sublevel._prefix] = {};

    dump.keys(sublevel, onkey, onend);

    function onkey (k) {
      var parts = k.split(sep)
        , idx = parts.shift()
        , val = parts.join(sep);

      if (!index[idx]) index[idx] = [];
      index[idx].push(val);
    }

    function onend () {
      cb(null, acc);
    }
  }

  asyncReduce(
      indexSublevels
    , {}
    , createSearch
    , cb
  )
};

'use strict';

var asyncReduce =  require('asyncreduce')

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
 * @param opts {Object} with the following properties: 
 *  - isIndex {Function} should return true if prefix is for a sublevel that is an index, otherwise false
 *  - limit {Number} specifies max number of values to read per sublevel index (useful for generating test samples)
 *  - maxValuesPerIndex {Number} specifies max number of values per indexed value to store (useful for generating test samples)
 * @param cb {Function} called with an error and/or the indexes
 */
var go = module.exports = function (sublevels, opts, cb) {

  var sublevelsToIndex = Object.keys(sublevels)
    .filter(opts.isIndex)
    .map(function (k) { return sublevels[k] })

  function indexSublevel (acc, sublevel, cb) {
    var sep = sublevel._sep || '\xff';
    var index = acc[sublevel._prefix] = {};
    var max = opts.maxValuesPerIndex || Infinity;

    sublevel
      .createReadStream({ 
          keys: true
        , values: false
        , limit: opts.limit || undefined
        , start: '' 
        , end: sep 
      })
      .on('data', onkey)
      .on('end', onend)

    function onkey (k) {
      var parts = k.split(sep)
        , idx = parts.shift()
        , val = parts.join(sep)

      if (!index[idx]) index[idx] = [];
      if (index[idx].length < max) index[idx].push(val);
    }

    function onend () {
      cb(null, acc);
    }
  }

  asyncReduce(
      sublevelsToIndex
    , {}
    , indexSublevel
    , cb
  )
};

// Test
if (typeof window === 'undefined' && !module.parent) {
  
  var level    =  require('level')
    , sublevel =  require('level-sublevel')
    , path     =  require('path')
    , fs       =  require('fs')
    ;

  var db = level(path.join(__dirname, 'store', 'sample.db'));
  db = sublevel(db);

  var subData = db.sublevel('data-json', { valueEncoding: 'json' })
    , byLocation = db.sublevel('idx-location')
    , byVenue = db.sublevel('idx-venue');


  var opts = {
      isIndex: function isIndex (key) {
        return (/^idx-/).test(key);
      }
    , maxValuesPerIndex: 2
  }

  go(db.sublevels, opts, function (err, res) {
    if (err) return console.error(err);
    console.log('done', res);
    var json = JSON.stringify(res, null, 2);
    fs.writeFileSync(path.join(__dirname, 'mocks', 'indexes.json'), json, 'utf8');
  });
}

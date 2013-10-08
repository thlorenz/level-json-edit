'use strict';
/*jshint asi: true */

var test = require('tape')

var level           =  require('level-test')({ mem: true })
  , sublevel        =  require('level-sublevel')
  , sublevelIndexes =  require('../client/sublevel-indexes')
  , initSublevels   =  require('./util/init-sublevels')
  , isIndex         =  initSublevels.isIndex

test('given sublevels with default separator some of which are indexes', function (t) {
  var db = sublevel(level(null))
  initSublevels(db, '\xff', run)

  function run () {
    sublevelIndexes(db.sublevels, { isIndex: isIndex }, function (err, res) {
      if (err) t.fail(err);
      t.deepEqual(
          res
        , { 'idx-uno':
            { eins: [ 'uno-1', 'uno-2' ],
              zwei: [ 'uno' ] },
            'idx-dos':
            { dva: [ 'dos-1', 'dos-2' ],
              odin: [ 'dos' ] } }
        , 'generates correct indexes'
      )
      t.end()
    })
  }
})

test('given sublevels with custom separator some of which are indexes', function (t) {
  var db = sublevel(level(null))
  initSublevels(db, '!', run)

  function run () {
    sublevelIndexes(db.sublevels, { isIndex: isIndex }, function (err, res) {
      if (err) t.fail(err);
      t.deepEqual(
          res
        , { 'idx-uno':
            { eins: [ 'uno-1', 'uno-2' ],
              zwei: [ 'uno' ] },
            'idx-dos':
            { dva: [ 'dos-1', 'dos-2' ],
              odin: [ 'dos' ] } }
        , 'generates correct indexes'
      )
      t.end()
    })
  }
})

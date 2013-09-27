'use strict';
/*jshint asi: true */

var test = require('tape')

var level           =  require('level-test')({ mem: true })
  , sublevel        =  require('level-sublevel')
  , sublevelIndexes =  require('../client/sublevel-indexes')

function toIndexPut (k) {
  return { key: k, value : true, type: 'put' }
}

function initSublevels (db, sep, cb) {
  var idxUno = db.sublevel('idx-uno', { sep: sep })
  var idxDos = db.sublevel('idx-dos', { sep: sep })
  var someOther = db.sublevel('some-other', { sep: sep })

  idxUno.batch([ 'eins' + sep + 'uno-1', 'eins' + sep + 'uno-2', 'zwei' + sep + 'uno' ].map(toIndexPut), onbatchedUno)

  function onbatchedUno () {
    idxDos.batch([ 'odin' + sep + 'dos', 'dva' + sep + 'dos-1', 'dva' + sep + 'dos-2' ].map(toIndexPut), onbatchedDos)
  }

  function onbatchedDos () {
    someOther.put('should', 'not appear as index', cb)
  }
}

function isIndex (key) {
  return (/^idx-/).test(key);
}

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

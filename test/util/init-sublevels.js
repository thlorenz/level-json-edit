'use strict';

var level           =  require('level-test')({ mem: true })
  , sublevel        =  require('level-sublevel')

function toIndexPut (k) {
  return { key: k, value : true, type: 'put' }
}

module.exports = exports = function initSublevels (db, sep, cb) {
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

exports.dataPrefix = 'data';

exports.initData = function (db, sep, cb) {
  var data = db.sublevel(exports.dataPrefix, { sep: sep, valueEncoding: 'json' })
  data.batch([
        { type: 'put' ,  key: 'uno-1' ,  value: { valof: 'uno-1' } }
     ,  { type: 'put' ,  key: 'uno-2' ,  value: { valof: 'uno-2' } }
     ,  { type: 'put' ,  key: 'uno'   ,  value: { valof: 'uno' } }
     ,  { type: 'put' ,  key: 'dos-1' ,  value: { valof: 'dos-1' } }
     ,  { type: 'put' ,  key: 'dos-2' ,  value: { valof: 'dos-2' } }
     ,  { type: 'put' ,  key: 'dos'   ,  value: { valof: 'dos' } }
  ] , cb)
}

exports.isIndex = function isIndex (key) {
  return (/^idx-/).test(key);
}

'use strict';

var level           =  require('level-test')({ mem: true })
  , sublevel        =  require('level-sublevel')

function toIndexPut (k) {
  return { key: k, value : true, type: 'put' }
}

module.exports = function initSublevels (db, sep, cb) {
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

module.exports.isIndex = function isIndex (key) {
  return (/^idx-/).test(key);
}

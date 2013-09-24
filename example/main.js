'use strict';

var engine = require('engine.io-stream');
var multilevel = require('multilevel');
var manifest = require('./manifest.json');
var sublevelIndexes = require('./sublevel-indexes-mock');

var db = multilevel.client(manifest);

var con = engine('/engine')
con.pipe(db.createRpcStream()).pipe(con)

var data       =  db.sublevels['data-json']
  , byVenue    =  db.sublevels['idx-venue']
  , byLocation =  db.sublevels['idx-location']

function isIndex (key) {
  return (/^idx-/).test(key);
}

var opts = {
  isIndex: isIndex
}

var indexesViewer = window.iv = renderEditor({ indexes: 'loading ...' }, 'indexes-viewer', 'view');
var dataEditor = window.de = renderEditor({ click: 'entry from indexes to load data here' }, 'data-editor');

sublevelIndexes(db.sublevels, opts.isIndex, function (err, indexes) {
  if (err) return console.error(err);

  indexesViewer.set(indexes);

  indexesViewer.expandAll();
  indexesViewer.table.onclick = function (ev) {
    var tgt = ev.target;
    if ((/^value/).test(tgt.getAttribute('class'))) {
      var key = tgt.innerText;
      data.get(key, function (err, val) {
        if (err) return console.error(err);
        dataEditor.set(val);
        dataEditor.expandAll();
      });
    }
  }
})

function renderEditor (json, clazz, mode) {
  var JSONEditor = require('jsoneditor').JSONEditor;

  var container = document.createElement('div');
  document.body.appendChild(container);
  if (clazz) container.setAttribute('class', clazz);

  var opts = {
    mode: mode || 'form',
    error: function (err) {
      console.error(err);
    }
  };

  return new JSONEditor(container, opts, json);
}

window.level = {
    manifest   :  manifest
  , db         :  db
  , data       :  data
  , byLocation :  byLocation
  , byVenue    :  byVenue
}


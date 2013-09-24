'use strict';

var engine = require('engine.io-stream');
var multilevel = require('multilevel');
var manifest = require('./manifest.json');
var sublevelIndexes = require('./sublevel-indexes');

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

sublevelIndexes(db.sublevels, opts.isIndex, function (err, res) {
  if (err) return console.error(err);
  renderEditor(res, 'view');
})

function renderEditor (json, mode) {
  var JSONEditor = require('jsoneditor').JSONEditor;

  var opts = {
    mode: mode || 'form',
    error: function (err) {
      console.error(err);
    }
  };

  var container = document.createElement('div');
  document.body.appendChild(container);

  var editor = new JSONEditor(container, opts, json);
}

window.level = {
    manifest   :  manifest
  , db         :  db
  , data       :  data
  , byLocation :  byLocation
  , byVenue    :  byVenue
}


'use strict';

var engine = require('engine.io-stream');
var multilevel = require('multilevel');
var manifest = require('./manifest.json');

var db = multilevel.client(manifest);
window.db = db;

var con = engine('/engine')
con.pipe(db.createRpcStream()).pipe(con)

db.get(db._sep + 'data-json' + db._sep + '/vienna/seeanddo/18249', function (err, json) {
  if (err) return console.error(err);
  renderEditor(json);  
});


function renderEditor (json) {

  var JSONEditor = require('jsoneditor').JSONEditor;

  var opts = {
    mode: 'form',
    error: function (err) {
      console.error(err);
    }
  };

  var container = document.createElement('div');
  document.body.appendChild(container);

  var editor = new JSONEditor(container, opts, json);
}


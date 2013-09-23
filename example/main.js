'use strict';

var engine = require('engine.io-stream');
var multilevel = require('multilevel');
var manifest = require('./manifest.json');

var db = multilevel.client(manifest);


var con = engine('/engine')
con.pipe(db.createRpcStream()).pipe(con)

var data       =  db.sublevels['data-json']
  , byVenue    =  db.sublevels['idx-venue']
  , byLocation =  db.sublevels['idx-location']

data.get('/vienna/seeanddo/18249', function (err, json) {
  if (err) return console.error(err);
  renderEditor(json);  
});

byLocation.get('zanzibarÿ/zanzibar/restaurants/500638', function (err, s) {
  if (err) return console.error(err);
  console.log(s);
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

window.level = {
    db         :  db
  , data       :  data
  , byLocation :  byLocation
  , byVenue    :  byVenue
}

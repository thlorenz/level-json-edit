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
    manifest   :  manifest
  , db         :  db
  , data       :  data
  , byLocation :  byLocation
  , byVenue    :  byVenue
}



// sublevels
var dump = require('level-dump')
  , asyncReduce = require('asyncreduce')
  

var sublevels = db.sublevels;
var indexSublevels = Object.keys(sublevels)
  .filter(isIndex)
  .map(function (k) { return sublevels[k] })

// passed by user
function isIndex (key) {
  return (/^idx-/).test(key);
}

function createSearch (acc, sublevel, cb) {
  var sep = sublevel._sep;
  var index = acc[sublevel._prefix] = {};

  dump(sublevel, onkeyval, onend);

  function onkeyval (kv) {
    var idx = kv.key.split(sep)[0]
      , val = kv.value;
    if (!index[idx]) index[idx] = [];
    index[idx].push(val);
  }

  function onend () {
    cb(null, acc);
  }
}

function onAllSearchesCreated (err, res) {
  if (err) return console.error(err);
  console.log(res);
}

asyncReduce(
    indexSublevels
  , {}
  , createSearch
  , onAllSearchesCreated
)

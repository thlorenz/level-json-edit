'use strict';

var engine           =  require('engine.io-stream')
  , xhr              =  require('xhr')
 ,  multilevel       =  require('multilevel')
 ,  EE               =  require('events').EventEmitter
 ,  setupViewNeditor =  require('./setup-indexesview-dataeditor')
  , renderEditor = require('./render-jsoneditor')

function getManifest (cb) {
  xhr({ 
      uri: '/level-manifest'
    , headers: { 'Content-Type': 'application/json' } 
  }, onresponse);
  function onresponse (err, res, body) {
    if (err) return cb(err);
    cb(null, JSON.parse(body));
  }
}

var go = module.exports = function (opts, containers) {
  var events = new EE();

  var indexesViewer = renderEditor(
      { indexes: 'loading ...' }
    , containers.indexes
    , 'view'
  )
  var dataEditor = renderEditor(
      { click: 'entry from indexes to load data here' }
    , containers.editor
  );
  var editors = { indexes: indexesViewer, editor: dataEditor };

  getManifest(onmanifest)

  function onmanifest (err, manifest) {
    if (err) return console.error(err);

    var db = multilevel.client(manifest);
    var con = engine('/engine')
    con.pipe(db.createRpcStream()).pipe(con)

    setupViewNeditor(db, events, opts, editors, containers);
  }

  return { on: events.on.bind(events), indexes: indexesViewer, editor: dataEditor };
};


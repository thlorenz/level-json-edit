'use strict';

var engine           =  require('engine.io-stream')
  , xhr              =  require('xhr')
 ,  multilevel       =  require('multilevel')
 ,  EE               =  require('events').EventEmitter
 ,  setupViewNeditor =  require('./setup-indexesview-dataeditor')

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
  getManifest(onmanifest)

  function onmanifest (err, manifest) {
    if (err) return console.error(err);

    var db = multilevel.client(manifest);
    var con = engine('/engine')
    con.pipe(db.createRpcStream()).pipe(con)

    window.db = db;
    setupViewNeditor(db, events, opts, containers);
  }

  return events;
};


'use strict';

var engine           =  require('engine.io-stream')
 ,  multilevel       =  require('multilevel')
 ,  manifest         =  require('../manifest.json')
 ,  EE               =  require('events').EventEmitter
 ,  setupViewNeditor =  require('./setup-indexesview-dataeditor')

var go = module.exports = function (opts) {
  var events = new EE();

  var db = multilevel.client(manifest);
  var con = engine('/engine')
  con.pipe(db.createRpcStream()).pipe(con)

  setupViewNeditor(db, events, opts);
  return events;
};

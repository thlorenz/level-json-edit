'use strict';

var engine           =  require('engine.io-stream')
 ,  multilevel       =  require('multilevel')
 ,  manifest         =  require('../manifest.json')
 ,  EE               =  require('events').EventEmitter
 ,  setupViewNeditor =  require('./setup-indexesview-dataeditor')

var go = module.exports = function (opts, containers) {
  var events = new EE();

  var db = multilevel.client(manifest);
  var con = engine('/engine')
  con.pipe(db.createRpcStream()).pipe(con)

  setupViewNeditor(db, events, opts, containers);
  return events;
};

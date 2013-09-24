'use strict';

var engine = require('engine.io-stream');
var multilevel = require('multilevel');
var manifest = require('./manifest.json');
var setupViewNeditor = require('./setup-indexesview-dataeditor');

var db = multilevel.client(manifest);

var con = engine('/engine')
con.pipe(db.createRpcStream()).pipe(con)


function isIndex (key) {
  return (/^idx-/).test(key);
}

var opts = {
    isIndex: isIndex
  , dataPrefix: 'data-json'
}

setupViewNeditor(db, opts);

window.level = {
    manifest   :  manifest
  , db         :  db
}


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
    isIndex          :  isIndex
  , dataPrefix       :  'data-json'
  , indexesContainer :  document.getElementsByClassName('indexes-viewer')[0]
  , editorContainer  :  document.getElementsByClassName('data-editor')[0]
}

var siteView = document.getElementsByClassName('site-view')[0];
var root = 'http://google.com';
var events = setupViewNeditor(db, opts);
events.on('entry-loaded', onentryloaded);

function onentryloaded (entry) {
  siteView.src = root + entry.key;
}

window.level = {
    manifest   :  manifest
  , db         :  db
}


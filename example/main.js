'use strict';

var levelEditor = require('../');

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
var root = 'http://www.concierge.com/travelguide';
var events = levelEditor(opts);
events.on('entry-loaded', onentryloaded);

function onentryloaded (entry) {
  siteView.src = root + entry.key;
}

window.level = {
    manifest   :  manifest
  , db         :  db
}


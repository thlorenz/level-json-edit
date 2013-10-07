'use strict';

/*jshint browser: true */

var levelEditor =  require('../')
  , config      =  require('./config')

var siteView = document.getElementsByClassName('site-view')[0];
var root = 'http://www.concierge.com/travelguide';
var containers = { 
    indexes    :  document.getElementsByClassName('indexes-viewer')[0]
  , editor     :  document.getElementsByClassName('data-editor')[0]
  , saveButton :  document.getElementsByClassName('save-button')[0]
};

var loginForm = window.creds = document.getElementById('credentials')
  , loginName = loginForm.getElementsByClassName('user-name')[0]
  , loginPass = loginForm.getElementsByClassName('user-pass')[0]

var le = levelEditor(config, containers)
le.on('db-inited', ondbInited)
  .on('entry-loaded', onentryLoaded)
  .on('entry-saving', onentrySaving)
  .on('save-invalid', onsaveInvalid)
  .on('entry-saved', onentrySaved)
  .on('error', console.error.bind(console));

function ondbInited (db, manifest) {
  loginForm.onsubmit = function (ev) {
    ev.preventDefault();
    var name = loginName.value
      , pass = loginPass.value

    db.auth({ name: name, pass: pass }, function (err, data) {
      if (err) return console.error(err);
      console.log('data', data);  
    })
  }

}

function onentryLoaded (entry) {
  le.editor.expandAll();
  siteView.src = root + entry.key;
}

function onentrySaving (entry) {
  console.log('saving', entry)
}

function onsaveInvalid (entry, previous) {
  console.error('invalid save', { current: entry, previous: previous });
}

function onentrySaved (entry) {
  console.log('saved', entry)
}

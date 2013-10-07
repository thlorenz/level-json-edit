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

var loginForm = document.getElementById('credentials')
  , loginName = loginForm.getElementsByClassName('user-name')[0]
  , loginPass = loginForm.getElementsByClassName('user-pass')[0]
  , loginSubmit = loginForm.getElementsByClassName('user-submit')[0]

function showLoggedIn () {
  loginName.setAttribute('disabled', true) 
  loginPass.setAttribute('disabled', true) 
  loginSubmit.setAttribute('disabled', true) 
}

var le = levelEditor(config, containers)
le.on('db-inited', ondbInited)
  .on('entry-loaded', onentryLoaded)
  .on('entry-saving', onentrySaving)
  .on('save-invalid', onsaveInvalid)
  .on('entry-saved', onentrySaved)
  .on('error', onerror);

function ondbInited (db, manifest) {
  loginForm.onsubmit = function (ev) {
    ev.preventDefault();
    var name = loginName.value
      , pass = loginPass.value

    db.auth({ name: name, pass: pass }, function (err, data) {
      if (err) { 
        // not nice, but simple
        return window.alert('Login was unsuccessful, please try again.')
      }

      showLoggedIn();
    })
  }

}

function onentryLoaded (entry) {
  le.editor.expandAll();
  siteView.src = root + entry.key;
}

function onentrySaving (entry) {
  //console.log('saving', entry)
}

function onsaveInvalid (entry, previous) {
  console.error('invalid save', { current: entry, previous: previous });
}

function onentrySaved (entry) {
  // TODO: success feedback
  console.log('saved', entry)
}

function onerror (err) {
  if (err.name === 'UnauthorizedWriteError') {
    return window.alert(err.message);
  }
  console.error(err);
}

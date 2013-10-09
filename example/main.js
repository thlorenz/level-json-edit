'use strict';

/*jshint browser: true */

var levelEditor =  require('../')
  , config      =  require('./config')
  , sublevels = require('./sublevels')

var siteView = document.getElementsByClassName('site-view')[0];
var root = 'http://www.concierge.com/travelguide';

var saveButton     =  document.getElementsByClassName('save-button')[0]
  , savedIndicator =  document.getElementsByClassName('saved-indicator')[0]

window.ind = savedIndicator;
var loginForm   =  document.getElementById('credentials')
  , loginName   =  loginForm.getElementsByClassName('user-name')[0]
  , loginPass   =  loginForm.getElementsByClassName('user-pass')[0]
  , loginSubmit =  loginForm.getElementsByClassName('user-submit')[0]

var containers = { 
    indexes    :  document.getElementsByClassName('indexes-viewer')[0]
  , editor     :  document.getElementsByClassName('data-editor')[0]
  , saveButton :  saveButton
};

function showLoggedIn () {
  loginName.setAttribute('disabled', true) 
  loginPass.setAttribute('disabled', true) 
  loginSubmit.setAttribute('disabled', true) 
}

function showSaved () {
  savedIndicator.classList.add('visible')  
  savedIndicator.classList.remove('hidden')  
}

function hideSaved () {
  savedIndicator.classList.remove('visible')  
  savedIndicator.classList.add('hidden')  
}

function showSave () {
  saveButton.classList.remove('hidden')
}

var le = levelEditor(config, containers)
le.on('db-inited', ondbInited)
  .on('entry-loaded', onentryLoaded)
  .on('entry-saving', onentrySaving)
  .on('save-invalid', onsaveInvalid)
  .on('entry-saved', onentrySaved)
  .on('error', onerror);

function observe (db) {
  function onLiveUpdate (type, data) {
    console.log('updated %s: %s', type, data);
  }

  var indexes = sublevels(db).idx
    , opts = { tail: true, old: false };

  indexes.byHasTodo
    .liveStream(opts)
    .on('data', onLiveUpdate.bind(null, 'hastodo'))

  indexes.byEdited
    .liveStream(opts)
    .on('data', onLiveUpdate.bind(null, 'edited'))
}

function ondbInited (db, manifest) {

  function onSubmitLogin (ev) {
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

  loginForm.onsubmit = onSubmitLogin;
  observe(db);
}


function onentryLoaded (entry) {
  le.editor.expandAll();
  hideSaved();
  showSave();
  //siteView.src = root + entry.key;
}

function onentrySaving (entry) {
  hideSaved();
}

function onsaveInvalid (entry, previous) {
  console.error('invalid save', { current: entry, previous: previous });
}

function onentrySaved (entry) {
  showSaved();
}

function onerror (err) {
  if (err.name === 'UnauthorizedWriteError') {
    return window.alert(err.message);
  }
  console.error(err);
}

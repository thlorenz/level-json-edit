'use strict';

/*jshint browser: true */

var levelEditor =  require('../')
  , config      =  require('./config')

var siteView = document.getElementsByClassName('site-view')[0];
var root = 'http://www.concierge.com/travelguide';
var containers = { 
    indexes :  document.getElementsByClassName('indexes-viewer')[0]
  , editor  :  document.getElementsByClassName('data-editor')[0]
  , saveButton  :  document.getElementsByClassName('save-button')[0]
};

levelEditor(config, containers)
  .on('entry-loaded', onentryLoaded)
  .on('entry-saving', onentrySaving)
  .on('save-invalid', onsaveInvalid)
  .on('entry-saved', onentrySaved)
  .on('error', console.error.bind(console));

function onentryLoaded (entry) {
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

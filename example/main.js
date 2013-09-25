'use strict';

var levelEditor =  require('../')
  , config      =  require('./config')

var siteView = document.getElementsByClassName('site-view')[0];
var root = 'http://www.concierge.com/travelguide';
var containers = { 
    indexes :  document.getElementsByClassName('indexes-viewer')[0]
  , editor  :  document.getElementsByClassName('data-editor')[0]
};

levelEditor(config, containers )
  .on('entry-loaded', onentryloaded)
  .on('error', console.error.bind(console));

function onentryloaded (entry) {
  siteView.src = root + entry.key;
}

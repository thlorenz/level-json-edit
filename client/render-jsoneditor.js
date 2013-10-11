'use strict';
var JSONEditor = require('jsoneditor').JSONEditor;

var go = module.exports = function renderEditor (json, container, mode, change, error) {

  var opts = {
    mode   :  mode || 'form',
    change :  change,
    error  :  error  
  };

  return new JSONEditor(container, opts, json);
}

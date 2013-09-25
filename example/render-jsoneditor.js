'use strict';
var JSONEditor = require('jsoneditor').JSONEditor;

var go = module.exports = function renderEditor (json, container, mode) {

  var opts = {
    mode: mode || 'form',
    error: function (err) {
      console.error(err);
    }
  };

  return new JSONEditor(container, opts, json);
}

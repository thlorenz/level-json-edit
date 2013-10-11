'use strict';
var JSONEditor = require('jsoneditor').JSONEditor;

var go = module.exports = function renderEditor (json, container, opts) {

  opts = opts || {};
  opts.mode = opts.mode || 'form';
  return new JSONEditor(container, opts, json);
}

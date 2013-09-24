'use strict';
var JSONEditor = require('jsoneditor').JSONEditor;

var go = module.exports = function renderEditor (json, clazz, mode) {

  // would be nice to be able to configure where the container gets attached to
  var container = document.createElement('div');
  document.body.appendChild(container);
  if (clazz) container.setAttribute('class', clazz);

  var opts = {
    mode: mode || 'form',
    error: function (err) {
      console.error(err);
    }
  };

  return new JSONEditor(container, opts, json);
}

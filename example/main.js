'use strict';

var JSONEditor = require('jsoneditor').JSONEditor;

var json = {
  "array": [1, 2, 3],
  "boolean": true,
  "null": null,
  "number": 123,
  "object": {"a": "b", "c": "d"},
  "string": "Hello World"
};
var opts = {
  mode: 'form',
  error: function (err) {
    console.error(err);
  }
};

var container = document.createElement('div');
document.body.appendChild(container);

var editor = new JSONEditor(container, opts, json);

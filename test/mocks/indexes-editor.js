'use strict';

module.exports = IndexesEditor;

function IndexesEditor () {
  if (!(this instanceof IndexesEditor)) return new IndexesEditor();
  this._set = [];
}

var proto = IndexesEditor.prototype;

proto.set = function (val) {
  this._set.push(val);
}

proto.table = {} // some code registers with onclick

'use strict';

module.exports = DataEditor;

function DataEditor () {
  if (!(this instanceof DataEditor)) return new DataEditor();
  this._set = [];
  this._get = undefined;
}

var proto = DataEditor.prototype;

proto.set = function (val) {
  this._set.push(val);
}

proto.get = function () {
  return this._get;
}

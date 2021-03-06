'use strict';

var engine           =  require('engine.io-stream')
  , xhr              =  require('xhr')
  , xtend            =  require('xtend')
  , multilevel       =  require('multilevel')
  , reconnect        =  require('reconnect-engine')
  , EE               =  require('events').EventEmitter
  , setupViewNeditor =  require('./setup-indexesview-dataeditor')
  , renderEditor     =  require('./render-jsoneditor')
  , indexesRefresher =  require('./indexes-refresher')

function getManifest (cb) {
  xhr({ 
      uri: '/level-manifest'
    , headers: { 'Content-Type': 'application/json' } 
    // since determining the sublevel tree server side when first client request comes in,
    // that first request may take a while to get served -- 20s is actually reasonable
    , timeout: 20000
  }, onresponse);

  function onresponse (err, res, body) {
    if (err) return cb(err);
    cb(null, JSON.parse(body));
  }
}

/**
 * Initializes the client side part of level-json-editor
 * 
 * @name exports
 * @function
 * @param opts {Object}
 *  - isIndex {Function} should return true if sublevel is an index, false if not
 *  - valiate {Function} (optional) return false if the data about to be saved is not valid
 *, - dataPrefix {String} the prefix of the sublevel holding the data
 * @param containers {Object}
 *  - indexes {DOMElement} will hold the db indexes
 *  - editor {DOMElement} will hold the actual data editor
 *  - saveButton {DOMElement} will hold the button which will save the edited data
 *  @return {Object} with the following properties:
 *    - on {Function} allows subscribing to various events
 *    - indexes {Object} the indexes viewer (json-editor)
 *    - editor {Object} the data editor (json-editor)
 *    - refreshIndexes {Function} refreshes the indexes view with the current data in index sublevels and calls back when finished
 */
var go = module.exports = LevelJsonEditor;
var proto = LevelJsonEditor.prototype;

function LevelJsonEditor (opts, containers) {
  if (!(this instanceof LevelJsonEditor)) return new LevelJsonEditor(opts, containers);

  var events = new EE();
  this._events = events;
  this.on = events.on.bind(events)

  this._opts = opts;
  this._endpoint = opts.endpoint || '/engine';
  this._containers = containers;

  this.indexesViewer = renderEditor(
      { indexes: 'loading ...' }
    , containers.indexes
    , xtend(this._defaultIndexesViewer(), opts.indexesViewer) 
  )


  this.editor = renderEditor(
      { click: 'entry from indexes to load data here' }
    , containers.editor
    , xtend(this._defaultEditor(), opts.editor)
  );

  getManifest(this._onmanifest.bind(this));
}

proto.refreshIndexes = function (cb) {
  if (!this._refreshIndexes) return this._emitError('Cannot refresh indexes before I initialized db');
  this._refreshIndexes(cb);
}

proto._defaultEditor = function () {
  return {
      mode   :  'form'
    , change :  this._onEditorChange.bind(this)
    , error  :  this._onEditorError.bind(this)
  }
}

proto._defaultIndexesViewer = function () {
  return { mode: 'view' };
}

proto.refreshData = function (cb) {
  if (!this._refreshData) return this._emitError('Cannot refresh data before I initialized db');
  this._refreshData(cb);
}

proto._onEditorChange = function () {
  this._events.emit('editor-changed', this.editor.get());
}

proto._onEditorError = function (err) {
  this._events.emit('error', err);
}

proto._emitError = function (s) {
  this._events.emit('error', new Error(s));
}

proto._onmanifest = function (err, manifest) {
  if (err) return console.error(err);
  var self = this;

  this._db = multilevel.client(manifest);
  reconnect(function (con) { 
    con.pipe(self._db.createRpcStream()).pipe(con) 
  })
  .connect(self._endpoint)

  self._events.emit('db-inited', self._db, manifest)

  var editors = { indexes: this.indexesViewer, editor: this.editor };
  var setup = setupViewNeditor(this._db, this._events, this._opts, editors, this._containers);

  this._refreshIndexes = indexesRefresher(this._db.sublevels, this.indexesViewer, this._opts);
  this._refreshData = setup.refreshData;
}

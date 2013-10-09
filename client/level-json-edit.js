'use strict';

var engine           =  require('engine.io-stream')
  , xhr              =  require('xhr')
 ,  multilevel       =  require('multilevel')
 ,  EE               =  require('events').EventEmitter
 ,  setupViewNeditor =  require('./setup-indexesview-dataeditor')
  , renderEditor = require('./render-jsoneditor')

function getManifest (cb) {
  xhr({ 
      uri: '/level-manifest'
    , headers: { 'Content-Type': 'application/json' } 
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
 *  - isIndes {Function} should return true if sublevel is an index, false if not
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
 */
var go = module.exports = function (opts, containers) {
  var events = new EE();

  var indexesViewer = renderEditor(
      { indexes: 'loading ...' }
    , containers.indexes
    , 'view'
  )
  var dataEditor = renderEditor(
      { click: 'entry from indexes to load data here' }
    , containers.editor
  );
  var editors = { indexes: indexesViewer, editor: dataEditor };

  getManifest(onmanifest)

  function onmanifest (err, manifest) {
    if (err) return console.error(err);

    var db = multilevel.client(manifest);
    var con = engine(opts.endpoint || '/engine')
    con.pipe(db.createRpcStream()).pipe(con)

    events.emit('db-inited', db, manifest)

    setupViewNeditor(db, events, opts, editors, containers);
  }

  return { on: events.on.bind(events), indexes: indexesViewer, editor: dataEditor };
};


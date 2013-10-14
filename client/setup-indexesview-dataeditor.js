'use strict';

var sublevelIndexes = require('./sublevel-indexes')

function noopValidate () { return true }

/**
 * Sets up the view showing the indexes and the editor itself.
 * Additionally it hooks up events to:
 *  - show relevant data when item from indexes is selected
 *  - save edited data when save button is clicked
 * 
 * @name exports
 * @function
 * @param db {Level} database
 * @param events {EventEmitter} into which it will emit events
 * @param opts {Object} with the following properties:
 *    - validate {Function} (optional) called with the entry to be saved 
 *      - return false if entry is invalid and shouldn't be saved
 *      - return true if entry is valid and can be saved
 *    - dataPrefix {String} the prefix of the sublevel that holds the actual data to show in the data editor
 *    - options used to index the sublevels, i.e. isIndex {Function} -- see more in sublevel-indexes.js
 * @param editors {Object} with the following properties:
 *    - indexes {DOMElement} holding the indexes view
 *    - editor: {DOMElement} holding the data editor
 * @param containers {Object} containing other important 
 *    - saveButton: {DOMElement} that represents the button that the user clicks in order to save edited data 
 */
var go = module.exports = function (db, events, opts, editors, containers) {
  var data = db.sublevels[opts.dataPrefix];
  var validate = opts.validate || noopValidate;
  var loaded;

  function loadData(key, suppressEvent, cb) {
    data.get(key, function (err, val) {
      if (err) {
        if (cb) cb(err);
        return events.emit('error', err);
      }

      loaded = { key: key, value: val };
      if (!suppressEvent) events.emit('entry-loading', loaded);

      editors.editor.set(val);

      if (!suppressEvent) events.emit('entry-loaded', loaded);
      if (cb) cb();
    });
  }

  sublevelIndexes(db.sublevels, opts, function (err, indexes) {
    if (err) return events.emit('error', err);
    loaded = null;

    editors.indexes.set(indexes);

    editors.indexes.table.onclick = function (ev) {
      var tgt = ev.target;
      if ((/^value/).test(tgt.getAttribute('class'))) {
        var key = tgt.innerText;
        loadData(key);
      }
    }

    if (containers.saveButton) {
      // TODO: disable while undo is not possible?
      containers.saveButton.onclick = function (ev) {
        var entry = { key: loaded.key, value: editors.editor.get() };
        events.emit('entry-saving', entry, loaded);

        if (!validate(entry, loaded)) return events.emit('save-invalid', entry, loaded);

        data.put(entry.key, entry.value, function (err) {
          if (err) return events.emit('error', err);  
          events.emit('entry-saved', entry);
        });
      }
    }

    events.emit('editor-initialized');
  })

  function refreshData (cb) {
    if (!loaded) return events.emit('error', 'cannot refresh data when none has been loaded');
    loadData(loaded.key, true, cb);
  }

  return { refreshData:  refreshData }
}

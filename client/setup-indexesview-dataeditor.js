'use strict';

var renderEditor = require('./render-jsoneditor')
  , sublevelIndexes = require('./sublevel-indexes');

// TODO: needs tests at least to test validation on save

function noopValidate () { return true }

var go = module.exports = function (db, events, opts, containers) {
  var data = db.sublevels[opts.dataPrefix];
  var validate = opts.valiate || noopValidate;

  var indexesViewer = renderEditor(
      { indexes: 'loading ...' }
    , containers.indexes
    , 'view'
  )
  var dataEditor = renderEditor(
      { click: 'entry from indexes to load data here' }
    , containers.editor
  );

  sublevelIndexes(db.sublevels, opts, function (err, indexes) {
    if (err) return events.emit('error', err);

    var loaded = null;

    indexesViewer.set(indexes);

    indexesViewer.table.onclick = function (ev) {
      var tgt = ev.target;
      if ((/^value/).test(tgt.getAttribute('class'))) {
        var key = tgt.innerText;

        data.get(key, function (err, val) {
          if (err) return console.error(err);
          loaded = { key: key, value: val };
          dataEditor.set(val);
          dataEditor.expandAll();
          events.emit('entry-loaded', loaded);
        });
      }
    }

    if (containers.saveButton) {
      // TODO: disable while undo is not possible?
      containers.saveButton.onclick = function (ev) {
        var entry = { key: loaded.key, value: dataEditor.get() };
        events.emit('entry-saving', entry);
        if (!validate(entry, loaded)) return events.emit('save-invalid', entry, loaded);

        data.put(entry.key, entry.value, function (err) {
          if (err) events.emit('error');  
          events.emit('entry-saved', entry);
        });
      }
    }

  })
}

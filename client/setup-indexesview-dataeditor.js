'use strict';

var sublevelIndexes = require('./sublevel-indexes');

// TODO: needs tests at least to test validation on save

function noopValidate () { return true }

var go = module.exports = function (db, events, opts, editors, containers) {
  var data = db.sublevels[opts.dataPrefix];
  var validate = opts.valiate || noopValidate;

  sublevelIndexes(db.sublevels, opts, function (err, indexes) {
    if (err) return events.emit('error', err);

    var loaded = null;

    editors.indexes.set(indexes);

    editors.indexes.table.onclick = function (ev) {
      var tgt = ev.target;
      if ((/^value/).test(tgt.getAttribute('class'))) {
        var key = tgt.innerText;

        data.get(key, function (err, val) {
          if (err) return console.error(err);
          loaded = { key: key, value: val };
          editors.editor.set(val);
          events.emit('entry-loaded', loaded);
        });
      }
    }

    if (containers.saveButton) {
      // TODO: disable while undo is not possible?
      containers.saveButton.onclick = function (ev) {
        var entry = { key: loaded.key, value: editors.editor.get() };
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

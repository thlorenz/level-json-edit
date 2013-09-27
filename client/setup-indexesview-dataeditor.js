'use strict';

var renderEditor = require('./render-jsoneditor')
  , sublevelIndexes = require('./sublevel-indexes');

var go = module.exports = function (db, events, opts, containers) {
  var data = db.sublevels[opts.dataPrefix];

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

    var key;

    indexesViewer.set(indexes);

    indexesViewer.table.onclick = function (ev) {
      var tgt = ev.target;
      if ((/^value/).test(tgt.getAttribute('class'))) {
        key = tgt.innerText;

        data.get(key, function (err, val) {
          if (err) return console.error(err);
          dataEditor.set(val);
          dataEditor.expandAll();
          events.emit('entry-loaded', { key: key, value: val });
        });
      }
    }

    if (containers.saveButton) {
      // TODO: disable while undo is not possible?
      containers.saveButton.onclick = function (ev) {
        var entry = { key: key, value: dataEditor.get() };
        events.emit('entry-saving', entry);
        data.put(entry.key, entry.value, function (err) {
          console.log('saved', err);
          if (err) events.emit('error');  
          events.emit('entry-saved', entry);
        });
      }
    }

  })
}

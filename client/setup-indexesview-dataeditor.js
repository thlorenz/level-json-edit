'use strict';

var renderEditor = require('./render-jsoneditor')
  , sublevelIndexes = require('./sublevel-indexes');

var go = module.exports = function (db, events, opts) {
  var data = db.sublevels[opts.dataPrefix];

  var indexesViewer = renderEditor(
      { indexes: 'loading ...' }
    , opts.indexesContainer
    , 'view'
  )
  var dataEditor = renderEditor(
      { click: 'entry from indexes to load data here' }
    , opts.editorContainer
  );

  sublevelIndexes(db.sublevels, opts, function (err, indexes) {
    if (err) return console.error(err);

    indexesViewer.set(indexes);

    indexesViewer.table.onclick = function (ev) {
      var tgt = ev.target;
      if ((/^value/).test(tgt.getAttribute('class'))) {
        var key = tgt.innerText;
        data.get(key, function (err, val) {
          if (err) return console.error(err);
          dataEditor.set(val);
          dataEditor.expandAll();
          events.emit('entry-loaded', { key: key, value: val });
        });
      }
    }
  })
}

'use strict';

var renderEditor = require('./render-jsoneditor');
var sublevelIndexes = require('./sublevel-indexes');

var go = module.exports = function (db, opts) {
  
  var data = db.sublevels[opts.dataPrefix];

  var indexesViewer = renderEditor({ indexes: 'loading ...' }, 'indexes-viewer', 'view');
  var dataEditor = renderEditor({ click: 'entry from indexes to load data here' }, 'data-editor');

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
        });
      }
    }
  })
}

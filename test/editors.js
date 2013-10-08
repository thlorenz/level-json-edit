'use strict';
/*jshint asi: true */

var test =  require('tape')

var level            =  require('level-test')({ mem: true })
  , sublevel         =  require('level-sublevel')
  , initSublevels    =  require('./util/init-sublevels')
  , initData         =  initSublevels.initData
  , dataPrefix       =  initSublevels.dataPrefix
  , isIndex          =  initSublevels.isIndex
  , setupEditors     =  require('../client/setup-indexesview-dataeditor')
  , EE               =  require('events').EventEmitter
  , getIndexesEditor =  require('./mocks/indexes-editor')
  , getDataEditor    =  require('./mocks/data-editor')
  , saveButton       =  require('./mocks/save-button')()
  , containers       =  { saveButton: saveButton }

function init (t, cb) {
  var db      =  sublevel(level(null))
    , editors =  { indexes: getIndexesEditor(), editor: getDataEditor() }

  initSublevels(db, '\xff', onInitedSublevels)

  function onInitedSublevels () {
    initData(db, '\xff', run)
  }

  function run () {
    function validate (entry) {
      return entry.value !== 'invalid';
    }

    var events = new EE();
    var opts = { 
        validate   :  validate
      , isIndex    :  isIndex
      , dataPrefix :  dataPrefix
    }

    events.on('error', function (err) {
      t.fail(err)
    })

    events.on('editors-initialized', onInitialized)
    setupEditors(db, events, opts, editors, containers)

    function onInitialized () {
      cb(db, events, editors, containers)
    }
  }
}

function loadUno1 (events, indexesEditor, cb) {
  var tgt = {
      getAttribute: function (clazz) { return 'value' }
    , innerText: 'uno-1'
  }
  var event = { target: tgt }

  indexesEditor.table.onclick(event)
  events.on('entry-loaded', cb) 
}

test('\nwhen editor is initialized', function (t) {
  init(t, check)

  function check (db, events, editors, containers) {
    var indexesEditor = editors.indexes
      , dataEditor = editors.editor

    t.deepEqual(
        indexesEditor._set
      , [ { 'idx-uno':
            { eins: [ 'uno-1', 'uno-2' ],
              zwei: [ 'uno' ] },
          'idx-dos':
            { dva: [ 'dos-1', 'dos-2' ],
              odin: [ 'dos' ] } } ]
      , 'sets correct indexes on indexes view'
    )

    t.test('# and I click on "uno-1" value in indexes table', function (t) {
      loadUno1(events, indexesEditor, function (loaded) {
        t.deepEqual(
            loaded
          , { key: 'uno-1', value: { valof: 'uno-1' } }
          , 'emits entry loaded with "uno-1"'
        )
        t.deepEqual(
            dataEditor._set   
          , [ { valof: 'uno-1' } ]
          , 'loads value of  "uno-1" into data editor'
        )

        t.end()
      })
    })
    t.end()
  }
})

test('\nwhen editor is initialized, data was selected', function (t) {
  init(t, function (db, events, editors, containers) {
    loadUno1(events, editors.indexes , function (loaded) {
      check (db, events, editors, containers)
    })
  })
 
  function check (db, events, editors, containers) {
    var indexesEditor = editors.indexes
      , dataEditor = editors.editor

    t.test('# and I save an invalid updated value to the database', function (t) {
      t.plan(2)

      dataEditor._get = 'invalid'
      events.on('entry-saving', function (entry) {
        t.deepEqual(
            entry
          , { key: 'uno-1', value: 'invalid' }
          , 'emits entry-saving with the entry about to be saved'
        )
      })

      events.on('save-invalid', function (entry) {
        t.deepEqual(
            entry
          , { key: 'uno-1', value: 'invalid' }
          , 'emits save-invalid with the entry about to be saved'
        )
      })
      saveButton.onclick()
    })

    t.end()
  }
})

test('\nwhen editor is initialized, data was selected', function (t) {
  init(t, function (db, events, editors, containers) {
    loadUno1(events, editors.indexes , function (loaded) {
      check (db, events, editors, containers)
    })
  })
 
  function check (db, events, editors, containers) {
    var indexesEditor = editors.indexes
      , dataEditor = editors.editor

    t.test('# and I save a valid updated value to the database', function (t) {
      t.plan(3)

      dataEditor._get = 'valid'
      events.on('entry-saving', function (entry) {
        t.deepEqual(
            entry
          , { key: 'uno-1', value: 'valid' }
          , 'emits entry-saving with the entry about to be saved'
        )
      })

      events.on('entry-saved', function (entry) {
        t.deepEqual(
            entry
          , { key: 'uno-1', value: 'valid' }
          , 'emits entry-saved with the entry when it was saved'
        )

        var data = db.sublevel(dataPrefix, { valueEncoding: 'json' })
        data.get('uno-1', function (err, value) {
          if (err) t.fail(err)
          t.equal(value, 'valid', 'stores valid value in db')
        })
      })
      saveButton.onclick()
    })

    t.end()
  }
})

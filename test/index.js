'use strict';
/*jshint asi: true */

var test = require('tap').test
var sut = require('../index')
var level = require('level')
  , sublevel = require('level-sublevel')
  , http = require('http')
  , devnull = require('dev-null')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function initNcloseDB (dbPath, cb) {

  level.destroy(dbPath, ondestroyed);
  function ondestroyed () {
    level(dbPath, function (err, db) {
      if (err) return cb(err);
      db = sublevel(db)
      var idxUno = db.sublevel('idx-uno')
      var idxDos = db.sublevel('idx-dos')
      var data = db.sublevel('data', { valueEndoding: 'json' })

      idxUno.put('uno', true, onputUno)

      function onputUno () {
        idxDos.put('dos', true, onputDos)
      }

      function onputDos () {
        data.put('uno-data', { foo: 'bar' }, onputData)
      }

      function onputData () {
        db.close(cb)
      }
    })
  }
}

test('\ngiven I have a level db with two indexes and a data sublevel the server sends correct manifest and streams correct data', function (t) {
  t.plan(6)
  var server = http.createServer()

  t.on('end', server.close.bind(server))
  server.listen(3333)

  var dbPath = __dirname + '/fixtures/sample.db'

  function isIndex (key) {
    return (/^idx-/).test(key);
  }


  server.once('listening', function () {

    initNcloseDB(dbPath, function (err) {
      if (err) t.fail(err)
      var manifest;

      sut(server, { dbPath: dbPath, dataPrefix: 'data', isIndex: isIndex })
        .on('error', function (err) { t.fail(err) })
        .on('inited-db', function (db) {
          t.equal(db, dbPath, 'inits db')
        })
        .on('sent-manifest', function (manifest_) {
          t.ok(manifest_, 'lets me know it sent manifest')
          manifest = manifest_
        })

      http
        .request({ port: 3333, path: '/level-manifest' })
        .once('response', function (res) {
          t.equal(res.statusCode, 200, '200 response');
          t.ok(res.headers['content-length'] > 0, 'with content');
          t.similar(res.headers['content-type'], /^application\/json/, 'application/json');

          var json = ''
          res
            .on('data', function (d) { json += d })
            .on('end', function () {
              var m = JSON.parse(json);
              t.deepEqual(m, manifest, 'sends correct manifest')
              testStreamingData()
            })
        })
        .end();
    })
  })

  function testStreamingData() {
    // TODO
  }

})

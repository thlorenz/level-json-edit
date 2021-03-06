'use strict';

var multilevel    =  require('multilevel')
  , level         =  require('level')
  , levelManifest =  require('level-manifest')
  , sublevel      =  require('level-sublevel')
  , subtree       =  require('level-subtree')
  , engineIO      =  require('engine.io-stream')
  , path          =  require('path')
  , EE            =  require('events').EventEmitter

// TODO: intercept puts to determine correctness ?

function defaultMixin (db) { }
  
/**
 * Initializes server side end of level-json-edit.
 *
 * @name exports
 * @function
 * @param server
 * @param config {Object} with the following properties:
 *  - dbPath {String} path to level db
 *  - isIndex {Function} should return true if prefix is for a sublevel that is an index, otherwise false
 *  - dataPrefix {String} the prefix of the sublevel that contains the json data
 *  - endpoint {String} ('/engine') any common string that server and client use to connect multilevel
 *  - mixin {Function} (optional) mixin extra functionality into the db, i.e. install a level-live-stream
 *  @param authentication {Object} passed to multilevel server creation (https://github.com/juliangruber/multilevel#authentication)
 *  - auth: {Function} to authenticate user
 *  - access: {Function} called when db is accessed with particular method, throw Error if user is not authorized
 */
var go = module.exports = function (server, config, authentication) { 
  var registeredIndexSubs = []
    , inited = null
    , events = new EE()
    , mixin = config.mixin || defaultMixin

  function initdb (cb) {
    if (inited) return cb(null, inited);

    level(config.dbPath, ondb);

    function ondb (err, db) {
      if (err) return cb(err);

      subtree(db).init(function (err, tree) {
        if (err) return cb(err);

        db = sublevel(db);

        // sublevel all index subs and the data sub in order to have them included in the manifest and thus be available for the client
        var indexes = Object.keys(tree)
          .filter(config.isIndex)
          .forEach(function (pref) {
            db.sublevel(pref)
            registeredIndexSubs.push(pref);
          })

        db.sublevel(config.dataPrefix, { valueEncoding: 'json' });
        mixin(db, registeredIndexSubs);

        var manifest = levelManifest(db);
        events.emit('inited-db', config.dbPath, db);
        cb(null, { db: db, manifest: manifest })
      })
    }
  }

  function connectDB (db) {
    var engine = engineIO(onconnection);
    function onconnection(con) {
      con.pipe(multilevel.server(db, authentication)).pipe(con);
    }

    engine.attach(server, config.endpoint || '/engine');
  }

  function initdbNserveManifest (res) {
    initdb(oniniteddb);

    function reportError(err) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(JSON.stringify(err));
      events.emit('error', err);
    }

    function oniniteddb (err, opts) {
      if (err) return reportError(err);
      var json;
      try {
        json = JSON.stringify(opts.manifest);

        res.writeHead(200, { 
            'Content-Type': 'application/json' 
          , 'Content-Length': json.length
        });
        res.end(json);

        connectDB(opts.db);
        inited = { db: opts.db, manifest: opts.manifest };

        events.emit('sent-manifest', opts.manifest);
      } catch (e) {
        reportError(e);
      }
    }
  }

  // Add '/level-manifest' route and prevent previously added handlers from returning a 404
  // see: https://github.com/LearnBoost/engine.io/blob/a2fff6fcabdfadb6177b99c456917635b3494432/lib/engine.io.js#L111-L125
  var listeners = server.listeners('request').slice(0);
  server.removeAllListeners('request');

  server.on('request', function(req, res){
    if (req.url === '/level-manifest') return initdbNserveManifest(res);
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].call(server, req, res);
    }
  })

  server.on('close', function () {
    if (inited && inited.db) {
      inited.db.close(function (err) {
        events.emit('closed-db', config.dbPath, err);
      });
    }
  })

  return events;
}

// Test
if (!module.parent) {
  var dbPath = path.join(__dirname, 'example', 'store');
  go(null, require('./example/config'), function (err, res) {
    if (err) return console.error(err);
    console.log(res);
  });
}

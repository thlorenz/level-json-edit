'use strict';

var multilevel    =  require('multilevel')
  , level         =  require('level')
  , levelManifest =  require('level-manifest')
  , sublevel      =  require('level-sublevel')
  , subtree       =  require('level-subtree')
  , engineIO      =  require('engine.io-stream')
  , path          =  require('path')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

/**
 * 
 * @name exports
 * @function
 * @param server 
 * @param config {Object} with the following properties:
 *  - dbPath {String} path to level db
 * @param cb {Function} called when multilevel was initialized and socket connected
 */
var go = module.exports = function (server, config, cb) {
  var registeredIndexSubs = []
    , inited = null

  function initdb (cb_) {
    if (inited) return cb_(null, inited);

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
        
        var manifest = levelManifest(db);
        cb_(null, { db: db, manifest: manifest })
      })
    }
  }

  function connectDB (db) {
    var engine = engineIO(onconnection);
    function onconnection(con) {
      con.pipe(multilevel.server(db)).pipe(con);  
    }

    engine.attach(server, '/engine');
  }

  function initdbNserveManifest (res, cb_) {
    initdb(oniniteddb);

    function reportError(err) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(err);
      cb(err);
    }

    function oniniteddb (err, opts) {
      if (err) return reportError(err);
      var json;
      try {
        json = JSON.stringify(opts.manifest);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(json);
        connectDB(opts.db);
        inited = { db: opts.db, manifest: opts.manifest };
        cb();
      } catch (e) {
        reportError(e);
      }
    }
  }

  // Add '/level-manifest' route and prevent previously added handlers from throwing a 404
  // see: https://github.com/LearnBoost/engine.io/blob/a2fff6fcabdfadb6177b99c456917635b3494432/lib/engine.io.js#L111-L125
  var listeners = server.listeners('request').slice(0);
  server.removeAllListeners('request');

  server.on('request', function(req, res){
    if (req.url === '/level-manifest') return initdbNserveManifest(res, cb);
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].call(server, req, res);
    }
  })
  server.on('close', function () {
    if (inited && inited.db) {
      inited.db.close(function (err) {
        console.log('closed db %s with %s', config.dbPath, err);
      });
    }
  })
}

// Test
if (!module.parent) {
  var dbPath = path.join(__dirname, 'example', 'store');  
  go(null, require('./example/config'), function (err, res) {
    if (err) return console.error(err);
    console.log(res);
  });
}

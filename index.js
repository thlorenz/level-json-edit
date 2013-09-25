'use strict';

var multilevel =  require('multilevel')
  , level      =  require('level')
  , sublevel   =  require('level-sublevel')
  , subtree    =  require('level-subtree')
  , engineIO   =  require('engine.io-stream')
  , path       =  require('path')

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
  var db = level(config.dbPath);
  var registeredIndexSubs = [];

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
      
    multilevel.writeManifest(db, path.join(__dirname, 'manifest.json'));

    var engine = engineIO(onconnection);
    function onconnection(con) {
      con.pipe(multilevel.server(db)).pipe(con);  
    }

    engine.attach(server, '/engine');

    cb(null, registeredIndexSubs);
  });
};



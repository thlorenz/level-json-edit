'use strict';

var http           =  require('http')
  , fs             =  require('fs')
  , path           =  require('path')
  , qs             =  require('qs')
  , build          =  require('./build')
  , levelEditor    =  require('../')
  , log            =  require('npmlog')
  , config         =  require('./config')
  , authentication =  require('./authentication')

function serveError (res, err) {
  console.error(err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end(err.toString());
}

function serveIndex (res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res); 
}

function serveBundle (res) {
  res.writeHead(200, { 'Content-Type': 'application/javascript' });
  build().pipe(res);
}

function serveCss (res, name) {
  res.writeHead(200, { 'Content-Type': 'text/css' });
  fs.createReadStream(path.join(__dirname, name + '.css')).pipe(res); 
}

function login (req, res) {
  var body = '';
  console.log(req.headers);
  if ( req.method !== 'POST' 
    || req.headers['content-type'] !== 'application/x-www-form-urlencoded') return;

  req
    .on('data', ondata)
    .on('end', onend)

  function antinuke() {
    body = '';
    res.writeHead(413, { 'Content-Type': 'text/plain' })
    res.end()

    req.connection.destroy();
  }

  function ondata (d) { 
    if (body.length > 1e6) return antinuke();
    body += d 
  }

  function onend () {
    var creds = qs.parse(body);

    log.info('server', 'creds', creds);

    // redirect to index page
    res.writeHead(302, { 'Content-Length': 0, 'Location': '/' })
    res.end()
  }

}

function serve404 (res) {
  res.writeHead(404);
  res.end();
}

var server = http.createServer(function (req, res) {
  log.info('server', '%s %s', req.method, req.url);
  if (req.url === '/') return serveIndex(res);
  if (req.url === '/bundle.js') return serveBundle(res);
  if (req.url === '/index.css') return serveCss(res, 'index');
  if (req.url === '/jsoneditor.css') return serveCss(res, 'jsoneditor');
  if (req.url === '/login') return login(req, res);

  serve404(res);
})

function inspect(obj, depth) {
  return require('util').inspect(obj, false, depth || 5, true);
}

function logOperation (type, arg1, arg2) {
  log.verbose('server'
    , type, arg1 && inspect(arg1)
    , arg2 && typeof arg2 !== 'function' && inspect(arg2)
  ) 
}

server.on('listening', function (address) {
  var a = server.address();
  log.info('server', 'listening: http://%s:%d', a.address, a.port);  

  levelEditor(server, config, authentication)
    .on('error', onerror)
    .on('sent-manifest', onsentManifest)
    .on('inited-db', oninitedDB)
    .on('closed-db', onclosedDB)

  function onerror (err) {
    log.error('server', err);
  }

  function onsentManifest (manifest) {
    log.info('server', 'sent manifest');
    log.verbose('server', inspect(manifest));
  }

  function oninitedDB (dbPath, db) {
    log.info('server', 'initialized db', dbPath);
    db.on('put', logOperation.bind(null, 'put'))
      .on('del', logOperation.bind(null, 'del'))
      .on('batch', logOperation.bind(null, 'batch'))
  }

  function onclosedDB (dbPath, err) {
    log.info('server', 'closed db', dbPath, err);
  }
})

//log.level = 'verbose';
server.listen(3000);

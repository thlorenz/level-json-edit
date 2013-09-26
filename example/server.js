'use strict';

var http        =  require('http')
  , fs          =  require('fs')
  , path        =  require('path')
  , build       =  require('./build')
  , levelEditor =  require('../')
  , log         =  require('npmlog')
  , config      =  require('./config')

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

  serve404(res);
})

function inspect(obj, depth) {
  return require('util').inspect(obj, false, depth || 5, true);
}

server.on('listening', function (address) {
  var a = server.address();
  log.info('server', 'listening: http://%s:%d', a.address, a.port);  

  levelEditor(server, config)
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

  function oninitedDB (dbPath) {
    log.info('server', 'initialized db', dbPath);
  }

  function onclosedDB (dbPath, err) {
    log.info('server', 'closed db', dbPath, err);
  }
})
server.listen(3000);

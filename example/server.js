'use strict';

var http = require('http')
  , fs = require('fs')
  , path = require('path')
  , build = require('./build')

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
  console.log('%s %s', req.method, req.url);
  if (req.url === '/') return serveIndex(res);
  if (req.url === '/bundle.js') return serveBundle(res);
  if (req.url === '/index.css') return serveCss(res, 'index');
  if (req.url === '/jsoneditor.css') return serveCss(res, 'jsoneditor');

  serve404(res);
});

server.on('listening', function (address) {
  var a = server.address();
  console.log('listening: http://%s:%d', a.address, a.port);  
});
server.listen(3000);

// DB
var multilevel = require('multilevel');
var level = require('level')
var db = level(path.join(__dirname, 'store', 'sample.db'), { valueEncoding: 'json' });

// Manifest
multilevel.writeManifest(db, path.join(__dirname, 'manifest.json'));

// Engine
var engine = require('engine.io-stream');
  
var engine = engine(onconnection);

function onconnection(con) {
  con.pipe(multilevel.server(db)).pipe(con);  
}

engine.attach(server, '/engine');




'use strict';

// img base needs fixing, so we are not even including this as our dev dependencies right now
// ideally we'll never run this build step again
var imgbase =  require('imgbase');
var path    =  require('path');
var fs      =  require('fs');
var root    =  path.dirname(require.resolve('jsoneditor'));
var cssFile =  path.join(root, 'jsoneditor.css');
var tgt = path.join(__dirname, '..', 'client', 'jsoneditor.css');

var cssStream = fs.createReadStream(cssFile);
imgbase(cssStream, fs.createWriteStream(tgt), { base: root });

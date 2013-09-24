'use strict';

var indexes = require('./mocks/indexes.json');

/**
 * Mock implementation of sublevel indexing in order to speed up development.
 * Make sure to first generate ./mocks/indexes.json from your db via the test script inside ./sublevel-indexes.js.
 */
var go = module.exports = function (sublevels, isIndex, cb) {
  cb(null, indexes);
};

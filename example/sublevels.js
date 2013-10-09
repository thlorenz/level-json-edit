'use strict';

var namespaces = require('./namespaces');
var data = namespaces.data
  , idx = namespaces.idx;

var go = module.exports = function (db) {
  var sublevels = {};

  sublevels.data = {
    // key url, value: data pulled out of relevant html section
    json: db.sublevel(data.json, { valueEncoding: 'json' })
  };

  sublevels.idx = {
    // index json venue data for easier review
    // Note: json data gets indexed when it is copied into the edit database

    // key: venueType/url, value: url
    byVenue: db.sublevel(idx.byVenue),

    // key: country/url, value: url
    byLocation: db.sublevel(idx.byLocation),
    
    // meta data indexes
    // all boolean - indexed as follows:
    //  - when true:  key: idx-edited!true !original-key -- value: url
    //  - when false: key: idx-edited!false!original-key -- value: url
    byEdited   :  db.sublevel(idx.byEdited),
    byReviewed :  db.sublevel(idx.byReviewed),
    byRevisit  :  db.sublevel(idx.byRevisit),
    byIgnore   :  db.sublevel(idx.byIgnore),
    byHasTodo  :  db.sublevel(idx.byHasTodo)
  };

  return sublevels;
};

'use strict';

exports.data = {
  // key url, value: data pulled out of relevant html section
  json: 'data-json'
};

exports.idx = {

  // key: venueType/url, value: url
  byVenue: 'idx-venue',

  // key: country/url, value: url
  byLocation: 'idx-location',

  // meta data indexes
  // all boolean - indexed as follows:
  //  - when true:  key: idx-edited!true !original-key -- value: url
  //  - when false: key: idx-edited!false!original-key -- value: url
  byEdited   :  'idx-edited',
  byReviewed :  'idx-reviewed',
  byRevisit  :  'idx-revisit',
  byIgnore   :  'idx-ignore',
  byHasTodo  :  'idx-hastodo'
};

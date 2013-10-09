'use strict';

var sublevels =  require('./sublevels')
  , log       =  require('npmlog')

function inspect(obj, depth) {
  return require('util').inspect(obj, false, depth || 5, true);
}

function logOperation (type, arg1, arg2) {
  log.verbose('server'
    , type, arg1 && inspect(arg1)
    , arg2 && typeof arg2 !== 'function' && inspect(arg2)
  ) 
}

function addMetadataHooks (db) {
  var jsonData      =  sublevels(db).data.json
    , byEditedSub   =  sublevels(db).idx.byEdited
    , byReviewedSub =  sublevels(db).idx.byReviewed
    , byRevisitSub  =  sublevels(db).idx.byRevisit
    , byIgnoreSub   =  sublevels(db).idx.byIgnore
    , byHasTodoSub  =  sublevels(db).idx.byHasTodo

  function addPureBooleanHook (vals) {
    var sub = vals[0]
      , prop = vals[1];

    jsonData.pre(function (val, add) {
      add({
        prefix :  sub,
        type   :  'put',
        key    :  val.value.metadata[prop] + '\xff' + val.key,
        value  :  val.key
      });
    });
  }

  [  [ byEditedSub   ,  'edited' ]
  ,  [ byReviewedSub ,  'reviewed' ]
  ,  [ byRevisitSub  ,  'revisit' ]
  ,  [ byIgnoreSub   ,  'ignore' ]
  ].forEach(addPureBooleanHook);

  // hasTodo is true when some data was entered in the todo field
  jsonData.pre(function (val, add) {
    var hasValue = !!val.value.metadata['todo'].trim().length;
    add({
      prefix :  byHasTodoSub,
      type   :  'put',
      key    :  hasValue + '\xff' + val.key,
      value  :  val.key
    });
  });
}

var go = module.exports = function (db) {
  addMetadataHooks(db);
  db.on('put', logOperation.bind(null, 'put'))
    .on('del', logOperation.bind(null, 'del'))
    .on('batch', logOperation.bind(null, 'batch'))
}

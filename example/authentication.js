'use strict';
var log       =  require('npmlog')
  , admin     =  process.env.LJEDIT_USER
  , adminPass =  process.env.LJEDIT_PASS 

exports.auth = function (user, cb) {
  var isAuthorized = user.name === admin && user.pass === adminPass;
  if (!isAuthorized) {
    // Purposely not loggin password here ;)
    log.info('auth', 'Illegal login attempt for user ', user.name);
    return cb(new Error('User ' + user.name + ' is not authorized!'));
  }
  log.info('auth', 'Successful login for', user.name);
  cb(null, { name: user.name });
}

exports.access = function (user, db, method, args) {
  var isWrite = /^(put|del|batch|write)/i.test(method)
    , userHasWriteAccess = user && user.name === admin

  if (isWrite && !userHasWriteAccess) {
    log.info('access', 'Illegal access attempt');
    throw new Error('read-only access');
  }
}

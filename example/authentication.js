'use strict';
var log       =  require('npmlog')
  , util      =  require('util')
  , admin     =  process.env.LJEDIT_USER
  , adminPass =  process.env.LJEDIT_PASS 

util.inherits(Error, UnauthorizedWriteError);
function UnauthorizedWriteError(msg) {
  this.name = 'UnauthorizedWriteError';
  this.message = msg;
}

exports.auth = function (user, cb) {
  var isAuthorized = user.name === admin && user.pass === adminPass;
  if (!isAuthorized) {
    // Purposely not loggin password here ;)
    log.info('auth', 'Illegal login attempt for user ', user.name);
    return cb(new Error('User ' + user.name + ' is not authorized!'));
  }
  log.info('auth', 'Successful login for user', user.name);
  cb(null, { name: user.name });
}

exports.access = function (user, db, method, args) {
  var isWrite = /^(put|del|batch|write)/i.test(method)
    , userHasWriteAccess = user && user.name === admin

  if (isWrite && !userHasWriteAccess) {
    log.info('access', 'Illegal access attempt');
    throw new UnauthorizedWriteError(method + ' is not allowed for user ' + user);
  }
}

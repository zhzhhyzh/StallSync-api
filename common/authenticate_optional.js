const passport = require('passport');
const returnError = require('../common/error');
const conKey = require('../constant/key');

module.exports = function authenticateRoute(req, res, next) {
  passport.authenticate('jwt', {
    session: false
  }, (err, user, info) => {
    if (err || !user) {
      req.user = '';
    }
    // Checking on blocking//
    req.user = user;

    next();
    //return next();
  })(req, res, next);

};

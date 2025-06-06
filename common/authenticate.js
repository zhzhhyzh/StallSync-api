const db = require("../models");
const usrlgnpf = db.usrlgnpf;
const passport = require('passport');
const returnError = require('../common/error');


module.exports = function authenticateRoute(req, res, next) {
  passport.authenticate('jwt', {
    session: false
  }, async (err, user, info) => {
    if (err || !user) {
      if (!err)
        return returnError(req, 408, "UNAUTHORIZED", res);
      else
        return returnError(req, "400", err, res);
    }

    // SSO
    // await new Promise(function (resolve) { setTimeout(resolve, 1000) });
    // Validate Token
    let userlgn = await usrlgnpf.findOne({
      where: {
        psusrunm: user.psusrunm
      }, raw: true
    });
    if (userlgn) {
      if (req.headers['authorization'] != userlgn.pslgntkn) return returnError(req, 408, "MULTIPLELOGIN", res);
      else if (userlgn.pslgntkn == '') return returnError(req, 408, "UNAUTHORIZED", res);
    }else return returnError(req, 408, "UNAUTHORIZED", res);
    // Checking on blocking//
    req.user = user;
    // if (user.status === false)
    //   return returnError(req, "400", "UNAUTHORIZED", res);

    if (req.headers['api-key'] !== process.env.API_KEY) {
      return returnError(req, 400, "INVALIDKEY", res);
    }

    next();
    //return next();
  })(req, res, next);

};

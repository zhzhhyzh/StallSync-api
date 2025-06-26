const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require("../models");
const psusrprf = db.psusrprf;
const psmrcpar = db.psmrcpar;
const psmbrprf = db.psmbrprf;
const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secret";

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {

      psusrprf.findByPk(jwt_payload.id, { raw: true }).then(async result => {
        if (result) {
          let user = {
            id: result.id,
            psusrunm: result.psusrunm,
            psusrnam: result.psusrnam,
            psusreml: result.psusreml,
            psusrtyp: result.psusrtyp,
            psfstlgn: result.psfstlgn,
            pschgpwd: result.pschgpwd,
            psusrsts: result.psusrsts,
            psusrphn: result.psusrphn,
            psusrpre: result.psusrpre,
            psusrrol: result.psusrrol
          }

          if (user.psusrtyp == "MBR") {
            let mbr = await psmbrprf.findOne({ where: { psusrnme: user.psusrunm }, raw: true, attributes: ['psmbruid','psmbrpts','psmbrcar'] })

            if (mbr) {
              user.psmbruid = mbr.psmbruid
              user.psmbrpts = mbr.psmbrpts
              user.psmbrcar = mbr.psmbrcar
            } else {
              user.psmbruid = ''
              user.psmbrpts = ''
              user.psmbrcar = ''
            }
          } else if (user.psusrtyp == "MCH") {
            let merchant = await psmrcpar.findOne({ where: { psmrcown: user.psusrunm }, raw: true, attributes: ['psmrcuid'] })

            if (merchant) {
              user.psmrcuid = merchant.psmrcuid
            } else {
              user.psmrcuid = ''
            }

          }

          return done(null, user);
        } else return done(null, false);
      }).catch(err => console.log(err));
    }));
};

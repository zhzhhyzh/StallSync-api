const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require("../models");
const psusrprf = db.psusrprf;
const mcmchpic = db.mcmchpic;
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
            psusrrol: result.psusrrol
          }

          if (user.psusrtyp == "MBR") {
            let mbr = await psmbrprf.findOne({ where: { psmbrphn: user.psusrunm }, raw: true, attributes: ['psmbruid'] })

            if (mbr) {
              user.psmbruid = mbr.psmbruid
            } else {
              user.psmbruid = ''
            }
          } else if (user.psusrtyp == "MCH") {
            let merchant = await mcmchpic.findOne({ where: { psconunm: user.psusrunm }, raw: true, attributes: ['psmchuid'] })

            if (merchant) {
              user.psusrmid = merchant.psmchuid
            } else {
              user.psusrmid = ''
            }

          }
         
          return done(null, user);
        } else return done(null, false);
      }).catch(err => console.log(err));
    }));
};

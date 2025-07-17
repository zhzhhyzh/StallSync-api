// Import
const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const _ = require("lodash");
const short = require("short-uuid");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

//Table import
const usrlgnpf = db.usrlgnpf;
const psusrprf = db.psusrprf;
const psrstpwd = db.psrstpwd;
const prfuncde = db.prfuncde;
const prfunacs = db.prfunacs;

//Common Function
// Common Function
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");
const connection = require("../common/db");
const general = require("../common/general");
// Input Validation
const userCreationValidation = require("../validation/user-creation");
const prUpdateProfileValidation = require("../validation/user-update");
const prResetPassValidation = require("../validation/prrstpwd-validation");
const validateLoginInput = require("../validation/user-login");

//Any Login
exports.login = async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return returnError(req, 400, errors, res);
  }

  if (req.headers["api-key"] != process.env.API_KEY)
    return returnError(req, 500, "INVALIDKEY", res);

  const username = req.body.username;
  const password = req.body.password;
  await psusrprf
    .findOne({
      where: {
        psusrunm: username,
      },
      raw: true,
    })
    .then(async (data) => {
      if (data) {
        if (data.psusrsts == "L")
          return returnError(req, 400, { username: "ACCOUNTLOCKED" }, res);
        else if (data.psusrsts == "C")
          return returnError(req, 400, { username: "ACCOUNTCLOSED" }, res);
        else if (data.psusrsts == "E")
          return returnError(req, 400, { username: "MEMBEREXPIRED" }, res);

        bcrypt.compare(password, data.psusrpwd).then(async (isMatch) => {
          if (isMatch) {
            const t = await connection.sequelize.transaction();

            let payload = {
              id: data.id,
              psusrunm: data.psusrunm,
              iat: Date.now(),
            };

            jwt.sign(payload, "secret", async (err, token) => {
              // Write / Update into Login Table - SSO Purpose
              await usrlgnpf
                .findOne({
                  where: {
                    psusrunm: data.psusrunm,
                  },
                  raw: true,
                })
                .then((lgnpf) => {
                  if (lgnpf) {
                    let options = {
                      pslgnsts: true,
                      pslgidat: new Date(),
                      pslgntkn: "Bearer " + token,
                    };
                    if (lgnpf.pslgnsts) {
                      options.pslgidat = new Date();
                    }
                    usrlgnpf
                      .update(options, {
                        transaction: t,
                        where: {
                          id: lgnpf.id,
                        },
                      })
                      .catch((err) => {
                        console.log(err);
                        t.rollback();
                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                      });
                  } else {
                    usrlgnpf
                      .create(
                        {
                          psusrunm: data.psusrunm,
                          pslgnsts: true,
                          pslgidat: new Date(),
                          pslgntkn: "Bearer " + token,
                        },
                        {
                          transaction: t,
                        }
                      )
                      .catch((err) => {
                        console.log(err);
                        t.rollback();
                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                      });
                  }
                });

              // Update First Login Flag
              await psusrprf
                .update(
                  {
                    psfstlgn: false,
                    psapptkn: req.body.push_token
                      ? req.body.push_token
                      : data.psapptkn,
                  },
                  {
                    transaction: t,
                    where: {
                      id: data.id,
                    },
                  }
                )
                .catch((err) => {
                  console.log(err);
                  t.rollback();
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });

              t.commit();
              return returnSuccess(200, { token: "Bearer " + token }, res);
            });
          } else
            return returnError(req, 400, { password: "INCORRECTPASS" }, res);
        });
      } else return returnError(req, 400, { username: "USERNOTFOUND" }, res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

//Login For Member
exports.login_m = async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return returnError(req, 400, errors, res);
  }

  if (req.headers["api-key"] != process.env.API_KEY)
    return returnError(req, 500, "INVALIDKEY", res);

  const username = req.body.username;
  const password = req.body.password;
  await psusrprf
    .findOne({
      where: {
        psusrunm: username,
      },
      raw: true,
    })
    .then(async (data) => {
      if (data) {
        if (data.psusrsts == "L")
          return returnError(req, 500, "ACCOUNTLOCKED", res);
        else if (data.psusrsts == "C")
          return returnError(req, 500, "ACCOUNTCLOSED", res);
        else if (data.psusrsts == "E")
          return returnError(req, 500, "MEMBEREXPIRED", res);

        if (data.psusrtyp != "MBR")
          return returnError(req, 500, "INVALIDLOGIN", res);

        bcrypt.compare(password, data.psusrpwd).then(async (isMatch) => {
          if (isMatch) {
            const t = await connection.sequelize.transaction();

            let payload = {
              id: data.id,
              psusrunm: data.psusrunm,
              iat: Date.now(),
            };

            jwt.sign(payload, "secret", async (err, token) => {
              // Write / Update into Login Table - SSO Purpose
              await usrlgnpf
                .findOne({
                  where: {
                    psusrunm: data.psusrunm,
                  },
                  raw: true,
                })
                .then((lgnpf) => {
                  if (lgnpf) {
                    let options = {
                      pslgnsts: true,
                      pslgidat: new Date(),
                      pslgntkn: "Bearer " + token,
                    };
                    if (lgnpf.pslgnsts) {
                      options.pslgidat = new Date();
                    }
                    usrlgnpf
                      .update(options, {
                        transaction: t,
                        where: {
                          id: lgnpf.id,
                        },
                      })
                      .catch((err) => {
                        console.log(err);
                        t.rollback();
                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                      });
                  } else {
                    usrlgnpf
                      .create(
                        {
                          psusrunm: data.psusrunm,
                          pslgnsts: true,
                          pslgidat: new Date(),
                          pslgntkn: "Bearer " + token,
                        },
                        {
                          transaction: t,
                        }
                      )
                      .catch((err) => {
                        console.log(err);
                        t.rollback();
                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                      });
                  }
                });

              // Update First Login Flag
              await psusrprf
                .update(
                  {
                    psfstlgn: false,
                    psapptkn: req.body.push_token
                      ? req.body.push_token
                      : data.psapptkn,
                  },
                  {
                    transaction: t,
                    where: {
                      id: data.id,
                    },
                  }
                )
                .catch((err) => {
                  console.log(err);
                  t.rollback();
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });

              t.commit();
              return returnSuccess(200, { token: "Bearer " + token }, res);
            });
          } else
            return returnError(req, 400, { password: "INCORRECTPASS" }, res);
        });
      } else return returnError(req, 400, { username: "USERNOTFOUND" }, res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.reset = async (req, res) => {
  let username = req.body.email;
  if (!username)
    return returnError(req, 400, { username: "USERNAMEISREQUIRED" }, res);

  // Check if user exists
  let user = await psusrprf.findOne({
    where: { psusreml: { [Op.eq]: [username] } },
    raw: true,
    attributes: { exclude: ["createdAt", "updatedAt", "crtuser", "mntuser"] },
  });
  if (!user) return returnError(req, 400, { email: "USERNOTFOUND" }, res);

  // Generate a new random hexadecimal password (8 characters)
  const rawPassword = crypto.randomBytes(4).toString("hex");
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Update the user's password and set the change password flag
  const update = await psusrprf.update(
    {
      psusrpwd: hashedPassword, // change to hashedPassword if using hashing
      pschgpwd: true,
    },
    {
      where: { psusrunm: user.psusrunm },
    }
  );

  if (!update) return returnError(req, 500, "FAILEDTOUPDATEPASSWORD", res);

  // Log and email
  let uid = uuidv4();
  const resetLog = {
    psrstuid: uid,
    psrstusr: username,
    psrstgdt: new Date(),
    psrststs: "A",
  };

  const check = await psrstpwd.findOne({ where: { psrstusr: user.psusrunm } });

  if (check) {
    await psrstpwd.update(resetLog, { where: { psrstusr: username } });
    common.writeMntLog(
      "psrstpwd",
      resetLog,
      await psrstpwd.findOne({ where: { psrstusr: username }, raw: true }),
      username,
      "C",
      username
    );
  } else {
    await psrstpwd.create(resetLog);
    common.writeMntLog(
      "psrstpwd",
      resetLog,
      await psrstpwd.findOne({ where: { psrstusr: username }, raw: true }),
      username,
      "A",
      username
    );
  }

  // Compose email
  let message = `
        <p>Dear ${user.psusrnam},</p>
        <p>You have requested to reset your password. Below is your new temporary password:</p>
        <p><strong>${rawPassword}</strong></p>
        <p>Please login and change your password as soon as possible.</p>
        <br/>
        <p>Thanks & Regards,<br/>StallSync</p>
    `;

  // Send email
  await general
    .sendEmail({
      toEmail: user.psusreml,
      toName: user.psusrnam,
      subject: "Your Password Has Been Reset",
      htmlContent: message,
    })
    .catch((err) => {
      console.error(err);
      return returnError(req, 500, "EMAILSENDFAILED", res);
    });

  return returnSuccessMessage(req, 200, "PASSWORDRESETSUCCESS", res);
};

exports.change_password = async (req, res) => {
  const oldpassword = req.body.password;
  const newpassword = req.body.newpassword;

  //Validation
  const { errors, isValid } = prResetPassValidation(req.body);
  if (!isValid) return returnError(req, 400, errors, res);

  psusrprf
    .findOne({
      where: {
        psusrunm: req.user.psusrunm,
      },
      raw: true,
      attributes: { exclude: ["createdAt", "updatedAt", "crtuser", "mntuser"] },
    })
    .then(async (user) => {
      if (!user)
        return returnError(req, 400, { psusrunm: "USERNOTFOUND" }, res);

      await bcrypt.compare(oldpassword, user.psusrpwd).then(async (isMatch) => {
        if (isMatch) {
          // Change Password
          bcrypt.genSalt(10, (err, salt) => {
            if (err) throw err;
            bcrypt.hash(newpassword, salt, (err, hash) => {
              if (err) throw err;
              let newPassword = hash;
              psusrprf
                .update(
                  {
                    psusrpwd: newPassword,
                    pschgpwd: false,
                  },
                  {
                    where: {
                      id: user.id,
                    },
                  }
                )
                .then(async () => {
                  common.writeMntLog(
                    "psusrprf",
                    user,
                    await psusrprf.findOne({
                      where: { psusrunm: user.psusrunm },
                      raw: true,
                    }),
                    user.psusrunm,
                    "C",
                    user.psusrunm
                  );
                  return returnSuccessMessage(req, 200, "PASSWORDRESET", res);
                })
                .catch((err) => {
                  console.log(err);
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            });
          });
        } else
          return returnError(req, 400, { oldpassword: "INVALIDPASSWORD" }, res);
      });
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.create = async (req, res) => {
  //Validation
  const { errors, isValid } = userCreationValidation(req.body, "N");
  if (!isValid) return returnError(req, 400, errors, res);

  let flag = await validatePassword(req.body.psusrpwd);
  if (!flag.flag) {
    let messages = "";
    for (var i = 0; i < flag.error.length; i++) {
      let obj = flag.error[i];
      messages += "<p>" + obj + "</p>";
    }
    return res.status(400).json({ message: { psusrpwd: messages } });
  }

  // Validate Code
  let description = await common.retrieveSpecificGenCodes(
    req,
    "USRROLE",
    req.body.psusrrol
  );
  if (!description || _.isEmpty(description.prgedesc))
    return returnError(req, 400, { psusrrol: "INVALIDDATAVALUE" }, res);

  // Validate Code
  let description2 = await common.retrieveSpecificGenCodes(
    req,
    "HPPRE",
    req.body.psusrpre
  );
  if (!description2 || _.isEmpty(description2.prgedesc))
    return returnError(req, 400, { psusrpre: "INVALIDDATAVALUE" }, res);

  // Check Duplicate
  let user = await psusrprf.findOne({
    where: {
      psusrunm: req.body.psusrunm,
    },
    raw: true,
  });
  if (user) return returnError(req, 400, { psusrunm: "USERALREADYEXIST" }, res);

  const new_psusrprf = {
    psusrunm: req.body.psusrunm,
    psusrnam: req.body.psusrnam,
    psusreml: req.body.psusreml,
    psusrpre: req.body.psusrpre,
    psusrsts: "A",
    psusrtyp: req.body.psusrtyp,
    psusrrol: req.body.psusrrol,
    psstsdt8: new Date(),
    psusrphn: req.body.psusrphn,
  };

  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(req.body.psusrpwd, salt, (err, hash) => {
      if (err) throw err;
      new_psusrprf.psusrpwd = hash;
      psusrprf
        .create(new_psusrprf)
        .then((data) => {
          let created = data.get({ plain: true });
          common.writeMntLog(
            "psusrprf",
            null,
            null,
            created.psusrunm,
            "A",
            req.body.psusrunm
          );
          return returnSuccessMessage(req, 200, "RECORDCREATED", res);
        })
        .catch((err) => {
          console.log(err);
          return returnError(req, 500, "UNEXPECTEDERROR", res);
        });
    });
  });
};

exports.signup = async (req, res) => {
  console.log("Incoming user payload:", req.body);
  //Validation
  const { errors, isValid } = userCreationValidation(req.body, "N");
  if (!isValid) return returnError(req, 400, errors, res);

  let flag = await validatePassword(req.body.psusrpwd);
  if (!flag.flag) {
    let messages = "";
    for (var i = 0; i < flag.error.length; i++) {
      let obj = flag.error[i];
      messages += "<p>" + obj + "</p>";
    }
    return res.status(400).json({ message: { psusrpwd: messages } });
  }

  // Validate Code
  let description = await common.retrieveSpecificGenCodes(
    req,
    "USRROLE",
    req.body.psusrrol
  );
  if (!description || _.isEmpty(description.prgedesc))
    return returnError(req, 400, { psusrrol: "INVALIDDATAVALUE" }, res);

  // Validate Code
  let description2 = await common.retrieveSpecificGenCodes(
    req,
    "HPPRE",
    req.body.psusrpre
  );
  if (!description2 || _.isEmpty(description2.prgedesc))
    return returnError(req, 400, { psusrpre: "INVALIDDATAVALUE" }, res);

  // Check Duplicate
  let user = await psusrprf.findOne({
    where: {
      psusrunm: req.body.psusrunm,
    },
    raw: true,
  });
  if (user) return returnError(req, 400, { psusrunm: "USERALREADYEXIST" }, res);

  const new_psusrprf = {
    psusrunm: req.body.psusrunm,
    psusrnam: req.body.psusrnam,
    psusreml: req.body.psusreml,
    psusrpre: req.body.psusrpre,
    psusrsts: "A",
    psusrtyp: "MBR",
    psusrrol: "MBR",
    psstsdt8: new Date(),
    psusrphn: req.body.psusrphn,
  };

  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(req.body.psusrpwd, salt, (err, hash) => {
      if (err) throw err;
      new_psusrprf.psusrpwd = hash;
      psusrprf
        .create(new_psusrprf)
        .then((data) => {
          let created = data.get({ plain: true });
          // common.writeMntLog('psusrprf', null, null, created.psusrunm, 'A', req.user.psusrunm?req.body.psusrunm : "");
          return returnSuccessMessage(req, 200, "RECORDCREATED", res);
        })
        .catch((err) => {
          console.log(err);
          return returnError(req, 500, "UNEXPECTEDERROR", res);
        });
    });
  });
};

exports.list = async (req, res) => {
  if (req.user.psusrtyp != "ADM")
    return returnError(req, 500, "INVALIDAUTHORITY", res);

  let limit = 10;
  if (req.query.limit) limit = req.query.limit;

  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * parseInt(limit);

  let option = {};
  if (req.query.search && !_.isEmpty(req.query.search)) {
    option = {
      [Op.or]: [
        { psusrunm: { [Op.like]: "%" + req.query.search + "%" } },
        { psusrunm: req.query.search },
        { psusrnam: { [Op.like]: "%" + req.query.search + "%" } },
        { psusrnam: req.query.search },
      ],
    };
  }

  // if (req.query.search && !_.isEmpty(req.query.search)) {
  //     option = {
  //         [Op.or]: [
  //             { psusrnam: { [Op.like]: req.query.psusrnam + '%' } },
  //             { psusrnam: req.query.psusrnam }
  //         ]
  //     }
  // }

  if (req.query.psusrsts && !_.isEmpty(req.query.psusrsts)) {
    option.psusrsts = req.query.psusrsts;
  }

  if (req.query.psusrrol && !_.isEmpty(req.query.psusrrol)) {
    option.psusrrol = req.query.psusrrol;
  }
  // option.psusrtyp = { [Op.ne]: "MBR" };
  const { count, rows } = await psusrprf.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psusrunm", "id"],
      "psusrunm",
      "psusrnam",
      "psusreml",
      "psusrsts",
      "psusrtyp",
      "psusrphn",
      "psusrrol",
    ],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];
    if (!_.isEmpty(obj.psusrtyp)) {
      let usrtyp = await common.retrieveSpecificGenCodes(
        req,
        "USRTYP",
        obj.psusrtyp
      );
      obj.psusrtypdsc = usrtyp.prgedesc ? usrtyp.prgedesc : "";
    }
    if (!_.isEmpty(obj.psusrsts)) {
      let usrsts = await common.retrieveSpecificGenCodes(
        req,
        "USRSTS",
        obj.psusrsts
      );
      obj.psusrstsdsc = usrsts.prgedesc ? usrsts.prgedesc : "";
    }
    if (!_.isEmpty(obj.psusrrol)) {
      let usrrol = await common.retrieveSpecificGenCodes(
        req,
        "USRROLE",
        obj.psusrrol
      );
      obj.psusrroldsc = usrrol.prgedesc ? usrrol.prgedesc : "";
    }
    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psusrprf", key: ["psusrunm"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.detail = (req, res) => {
  if (req.user.psusrtyp != "ADM")
    return returnError(req, 500, "INVALIDAUTHORITY", res);

  const usrnm = req.query.id ? req.query.id : "";
  if (usrnm == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
  psusrprf
    .findOne({
      where: {
        psusrunm: usrnm,
      },
      raw: true,
      attributes: [
        ["id", "psusrunm"],
        "psusrunm",
        "psusrnam",
        "psusreml",
        "psusrsts",
        "psusrtyp",
        "psusrphn",
        "psusrrol",
        "psusrpre",
      ],
    })
    .then(async (usrunme) => {
      if (usrunme) {
        if (!_.isEmpty(usrunme.psusrtyp)) {
          let usrtyp = await common.retrieveSpecificGenCodes(
            req,
            "USRTYP",
            usrunme.psusrtyp
          );
          usrunme.psusrtypdsc = usrtyp.prgedesc ? usrtyp.prgedesc : "";
        }
        if (!_.isEmpty(usrunme.psusrsts)) {
          let usrsts = await common.retrieveSpecificGenCodes(
            req,
            "USRSTS",
            usrunme.psusrsts
          );
          usrunme.psusrstsdsc = usrsts.prgedesc ? usrsts.prgedesc : "";
        }
        if (!_.isEmpty(usrunme.psusrrol)) {
          let usrrol = await common.retrieveSpecificGenCodes(
            req,
            "USRROLE",
            usrunme.psusrrol
          );
          usrunme.psusrroldsc = usrrol.prgedesc ? usrrol.prgedesc : "";
        }
        return returnSuccess(200, usrunme, res);
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.update = async (req, res) => {
  if (req.user.psusrtyp != "ADM")
    return returnError(req, 500, "INVALIDAUTHORITY", res);

  //Validation
  const { errors, isValid } = prUpdateProfileValidation(req.body, "C");
  if (!isValid) return returnError(req, 400, errors, res);

  await psusrprf
    .findOne({
      where: {
        psusrunm: req.body.id,
      },
      raw: true,
      attributes: { exclude: ["createdAt", "updatedAt", "crtuser", "mntuser"] },
    })
    .then(async (user) => {
      if (!user)
        return returnError(req, 400, { psusrunm: "USERNOTFOUND" }, res);

      let obj = req.body;

      if (obj.psusrsts && obj.psusrsts != user.psusrsts)
        obj.psstsdt8 = new Date();
      obj.mntuser = req.user.psusrunm;
      obj.psusrunm = user.psusrunm;

      const new_psusrprf = {
        psusrunm: obj.psusrunm,
        psusrnam: obj.psusrnam,
        psusreml: obj.psusreml,
        psusrphn: obj.psusrphn,
        psusrpre: obj.psusrpre,
        psusrsts: obj.psusrsts,
        psusrtyp: obj.psusrtyp,
        psusrrol: obj.psusrrol,
      };

      await psusrprf
        .update(new_psusrprf, {
          where: {
            id: user.id,
          },
        })
        .then(async (update) => {
          common.writeMntLog(
            "psusrprf",
            update,
            await psusrprf.findOne({
              where: { psusrunm: user.psusrunm },
              raw: true,
            }),
            user.psusrunm,
            "C",
            user.psusrunm
          );
          return returnSuccessMessage(req, 200, "USERUPDATED", res);
        })
        .catch((err) => {
          console.log(err);
          return returnError(req, 500, "UNEXPECTEDERROR", res);
        });
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.delete = async (req, res) => {
  if (req.user.psusrtyp != "ADM")
    return returnError(req, 500, "INVALIDAUTHORITY", res);

  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  await psusrprf
    .findOne({
      where: {
        psusrunm: id,
      },
      raw: true,
    })
    .then((user) => {
      // if (user.psusrtyp != 'ADM')
      //     return returnError(req, 500, "USERACCOUNTCANTDELETE", res);
      if (user) {
        psusrprf
          .destroy({
            where: {
              id: user.id,
            },
          })
          .then(() => {
            common.writeMntLog(
              "psusrprf",
              null,
              null,
              user.psusrunm,
              "D",
              req.user.psusrunm
            );
            return returnSuccessMessage(req, 200, "RECORDDELETED", res);
          })
          .catch((err) => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
          });
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.rollback = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  console.log("Rollback request body:", req.body);
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  await psusrprf
    .findOne({
      where: {
        psusrunm: id,
      },
      raw: true,
    })
    .then((user) => {
      console.log("Found user:", user);
      if (user) {
        psusrprf
          .destroy({
            where: {
              id: user.id,
            },
          })
          .then(() => {
            common.writeMntLog(
              "psusrprf",
              null,
              null,
              user.psusrunm,
              "D",
              req.user.psusrunm
            );
            return returnSuccessMessage(req, 200, "RECORDDELETED", res);
          })
          .catch((err) => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
          });
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.home = async (req, res) => {
  let user = {};
  let mbr = {};

  // if (req.user.psusrtyp == "MBR") {
  //     user = await psmbrcon.findOne({
  //         where: {
  //             psdrawid: req.user.psusrunm
  //         }, raw: true
  //     });
  //     mbr = await psmember.findOne({
  //         where: {
  //             psmberid: user.psmberid
  //         }, raw: true
  //     });
  // }

  // Check First Login
  let data = {};
  data.psusrtyp = req.user.psusrtyp;
  data.psusrunm = req.user.psusrunm;
  data.psusrnme = user && user.psmcntpn ? user.psmcntpn : req.user.psusrnam;
  data.psusrnam = user && user.psmcntpn ? user.psmcntpn : req.user.psusrnam;
  data.psmberid = req.user.psmberid;
  data.psusrals = req.user.psusrals;
  data.psmbrnam = mbr.psmbrnam;
  data.psmbdate = mbr.psmbdate;
  data.psmbbzrn = mbr.psmbbzrn;
  data.psmblicn = mbr.psmblicn;

  data.emlind = false;
  data.settfa = false;
  if (req.user.pschgpwd || req.user.psfstlgn) data.chgpwd = true;
  else data.chgpwd = false;

  if (!_.isEmpty(req.user.psusrrol)) {
    // Get Functions Count
    let func_count = await prfuncde.count();
    // Get Function Groups
    let grouped_functions = {};
    let error = false;
    let result = await common
      .redisGet("access_matrix-" + req.user.psusrrol)
      .catch((err) => {
        error = true;
      });

    if (error) {
      let fungrp = await common.retrieveGenCodes(req, "FUNGRP");
      if (fungrp) {
        for (var i = 0; i < fungrp.length; i++) {
          let grp = fungrp[i];
          let functions = await prfuncde.findAll({
            where: {
              prfungrp: grp.prgecode,
            },
            raw: true,
            attributes: {
              exclude: ["createdAt", "updatedAt", "crtuser", "mntuser"],
            },
          });

          let functions_arr = [];
          for (var j = 0; j < functions.length; j++) {
            let obj = functions[j];
            let access = await prfunacs.findAll({
              where: {
                pracsfun: obj.prfuncde,
                pracsrol: req.user.psusrrol,
                pracssts: true,
              },
              raw: true,
            });

            let checked = await searchFunction(req, obj, access, func_count);
            functions_arr.push({
              prfuncde: checked.function,
              prfunnme: checked.functiondsc,
              prfunlnm: checked.functionlds,
              prfunacs: obj.prfunsts ? (checked.checked ? 1 : 0) : 0,
              actions: checked.actions,
            });
          }
          grouped_functions[grp.prgecode] = functions_arr;
        }
      }
      data.access = grouped_functions;
    } else {
      if (!_.isEmpty(result)) {
        grouped_functions = result; //JSON.parse(result);
      } else if (_.isEmpty(result)) {
        let fungrp = await common.retrieveGenCodes(req, "FUNGRP");
        if (fungrp) {
          for (var i = 0; i < fungrp.length; i++) {
            let grp = fungrp[i];
            let functions = await prfuncde.findAll({
              where: {
                prfungrp: grp.prgecode,
              },
              raw: true,
              attributes: {
                exclude: ["createdAt", "updatedAt", "crtuser", "mntuser"],
              },
            });

            let functions_arr = [];
            for (var j = 0; j < functions.length; j++) {
              let obj = functions[j];
              let access = await prfunacs.findAll({
                where: {
                  pracsfun: obj.prfuncde,
                  pracsrol: req.user.psusrrol,
                  pracssts: true,
                },
                raw: true,
              });

              let checked = await searchFunction(req, obj, access, func_count);
              functions_arr.push({
                prfuncde: checked.function,
                prfunnme: checked.functiondsc,
                prfunlnm: checked.functionlds,
                prfunacs: obj.prfunsts ? (checked.checked ? 1 : 0) : 0,
                actions: checked.actions,
              });
            }
            grouped_functions[grp.prgecode] = functions_arr;
          }
        }
        await common.redisSet(
          "access_matrix-" + req.user.psusrrol,
          JSON.stringify(grouped_functions)
        );
      }
    }

    data.access = grouped_functions;
  } else data.access = [];
  return returnSuccess(200, data, res);
};

async function validatePassword(password) {
  return new Promise(async (resolve, reject) => {
    try {
      let syspar = await common.getSysPar();
      // let syspar = null;
      if (syspar && syspar.prpwdpol == "Y") {
        let pwdpols = await prpwdpol.findOne({
          where: {
            id: 1,
          },
          raw: true,
        });

        errors = [];
        if (pwdpols) {
          pwdpols.prpwdlen > 0
            ? password.length > parseInt(pwdpols.prpwdlen)
              ? ""
              : errors.push(
                  pwdpols.prlenmsg.replace(
                    "&prpwdlen",
                    pwdpols.prpwdlen.toString()
                  )
                )
            : "";

          pwdpols.prpwdupc
            ? /[A-Z]/g.test(password)
              ? ""
              : errors.push(pwdpols.prupcmsg)
            : "";

          pwdpols.prpwdlwc
            ? /[a-z]/g.test(password)
              ? ""
              : errors.push(pwdpols.prlwcmsg)
            : "";

          let regex = "";
          pwdpols.prpwdspc
            ? pwdpols.prspcchr.length > 0
              ? (regex = new RegExp(pwdpols.prspcchr.toString(), "g"))
              : ""
            : "";

          pwdpols.prpwdspc
            ? pwdpols.prspcchr.length > 0
              ? regex.test(password)
                ? ""
                : errors.push(pwdpols.prspcmsg)
              : ""
            : "";

          pwdpols.prpwdnum
            ? /\d/g.test(password)
              ? ""
              : errors.push(pwdpols.prnummsg)
            : "";

          if (errors.length < 1) return resolve({ error: errors, flag: true });
          else return resolve({ error: errors, flag: false });
        } else return resolve({ error: errors, flag: true });
      } else return resolve({ error: [], flag: true });
    } catch (err) {
      console.log(err);
      return reject(err);
    }
  });
}

exports.profile = async (req, res) => {
  // if (req.user.psusrtyp === 'ADM') {
  //CHECK PROFILE
  psusrprf
    .findOne({
      where: {
        id: req.user.id,
      },
      raw: true,
      attributes: [
        ["id", "psusrunm"],
        "psusrunm",
        "psusrtyp",
        "psusrnam",
        "psusreml",
        "psusrsts",
        "psusrphn",
        // , 'psusrals', 'psredind'
      ],
    })
    .then(async (profile) => {
      if (profile) {
        if (!_.isEmpty(profile.psusrtyp)) {
          let usrtyp = await common.retrieveSpecificGenCodes(
            req,
            "USRTYP",
            profile.psusrtyp
          );
          profile.psusrtypdsc = usrtyp.prgedesc ? usrtyp.prgedesc : "";
        }
        if (!_.isEmpty(profile.psusrsts)) {
          let usrsts = await common.retrieveSpecificGenCodes(
            req,
            "USRSTS",
            profile.psusrsts
          );
          profile.psusrstsdsc = usrsts.prgedesc ? usrsts.prgedesc : "";
        }
        // if (!_.isEmpty(profile.psredind)) {
        //     let redinddsc = await common.retrieveSpecificGenCodes(req, 'YESORNO', profile.psredind);
        //     profile.psredinddsc = redinddsc.prgedesc ? redinddsc.prgedesc : '';
        // }

        return returnSuccess(200, profile, res);
      } else return returnError(req, 400, "USERNOTFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 400, "UNEXPECTEDERROR", res);
    });
  // }
  // else if (req.user.psusrtyp === 'MBR') {
  //     //CHECK PROFILE
  //     psusrprf.findOne({
  //         where: {
  //             id: req.user.id
  //         }, raw: true
  //     }).then(async profile => {
  //         if (profile) {
  //             psmbrprf.findOne({
  //                 where: {
  //                     psdrawid: profile.psusrunm
  //                 }, raw: true, attributes: [['psmberid', 'id'], 'psmberid', 'psusrsts', 'psmsaltn']
  //             }).then(async mbrcon => {
  //                 if (mbrcon) {
  //                     let member = await psmember.findOne({
  //                         where: {
  //                             psmberid: mbrcon.psmberid
  //                         }, raw: true
  //                     });
  //                     if (member) {
  //                         mbrcon.psmbrnam = member.psmbrnam;
  //                         mbrcon.psmbdate = member.psmbdate;
  //                         mbrcon.psmbbzrn = member.psmbbzrn;
  //                         mbrcon.psmblicn = member.psmblicn;

  //                         if (!_.isEmpty(mbrcon.psmsaltn)) {
  //                             let description = await common.retrieveSpecificGenCodes(req,'SALTN', mbrcon.psmsaltn);
  //                             mbrcon.psmsaltndsc = description.prgedesc && !_.isEmpty(description.prgedesc) ? description.prgedesc : '';
  //                         }
  //                         if (!_.isEmpty(mbrcon.psusrsts)) {
  //                             let description = await common.retrieveSpecificGenCodes(req,'USRSTS', mbrcon.psusrsts);
  //                             mbrcon.psusrstsdsc = description.prgedesc && !_.isEmpty(description.prgedesc) ? description.prgedesc : '';
  //                         }
  //                         if (!_.isEmpty(profile.psredind)) {
  //                             let redinddsc = await common.retrieveSpecificGenCodes(req,'YESORNO', profile.psredind);
  //                             mbrcon.psredind = profile.psredind;
  //                             mbrcon.psredinddsc = redinddsc.prgedesc ? redinddsc.prgedesc : '';
  //                         }
  //                         mbrcon.psusrnam = profile.psusrnam;
  //                         mbrcon.psusrphn = profile.psusrphn;
  //                         mbrcon.psusreml = profile.psusreml;
  //                         mbrcon.psusrtyp = profile.psusrtyp;
  //                         mbrcon.psusrals = profile.psusrals;
  //                         mbrcon.psusrunm = profile.psusrunm;
  //                         return returnSuccess(200, mbrcon, res);
  //                     } else return returnError(req, 400, "USERNOTFOUND", res);
  //                 } else return returnError(req, 400, "USERNOTFOUND", res);
  //             })
  //         } else return returnError(req, 400, "USERNOTFOUND", res);
  //     }).catch(err => {
  //         console.log(err);
  //         return returnError(req, 400, 'UNEXPECTEDERROR', res);
  //     });
  // }

  // else {
  //     return returnError(req, 500, 'INVALIDAUTHORITY', res);
  // }
};

exports.update_profile = async (req, res) => {
  // if(req.user.psusrtyp==="MBR"){

  //     //Validation
  //     const { errors, isValid } = prUpdateProfileValidation(req.body, 'C');
  //     if (!isValid) return returnError(req, 400, errors, res);

  //     // Validate Code
  //     let sts = await common.retrieveSpecificGenCodes(req,'USRSTS', req.body.psusrsts);
  //     if (!sts || _.isEmpty(sts.prgedesc)) return returnError(req, 400, { psusrsts: "INVALIDDATAVALUE" }, res);

  //     const t = await connection.sequelize.transaction();

  //     await psmbrprf.findOne({where:{psmbrraw:req.user.psusrunm},attributes:['psmbruid'],raw:true})
  //     .then(async (mbr)=>{

  //         if(mbr){
  //             await psmbrprf.update(
  //                 {
  //                     psmbrnam: req.body.psusrnam,
  //                     psmbrphn: req.body.psusrphn,
  //                     psmbreml: req.body.psusreml,
  //                 },
  //                 {
  //                     where:{psmbrraw:req.user.psusrunm},
  //                     transaction:t
  //                 }
  //             ).then(async ()=>{
  //                 await psusrprf.findOne({where:{psusrunm:req.user.psusrunm},attributes:['psusrunm'],raw:true})
  //                 .then(async (user)=>{
  //                     if(user){
  //                         await psusrprf.update(
  //                             {
  //                                 psusrnam:req.body.psusrnam,
  //                                 psusreml:req.body.psusreml,
  //                                 psusrphn: req.body.psusrphn,
  //                                 psusrsts: req.body.psusrsts,
  //                             },
  //                             {
  //                                 where:{psusrunm:user.psusrunm},
  //                                 transaction:t
  //                             }
  //                         ).then(async()=>{
  //                             common.writeMntLog('psrmbrprf', mbr, await psmbrprf.findByPk(mbr.id, { raw: true }), mbr.psmbruid, 'C', req.user.psusrunm);
  //                             common.writeMntLog('psusrprf', user, await psusrprf.findByPk(user.id, { raw: true }), user.psusrunm, 'C', req.user.psusrunm);
  //                             await t.commit();
  //                             return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
  //                         })
  //                     }else{
  //                         await t.rollback();
  //                         return returnError(req,500,"USERNOTFOUND",res)
  //                     }

  //                 })

  //             })
  //         }else{
  //             await t.rollback()
  //             return returnError(req,500,"USERNOTFOUND",res)
  //         }

  //     })

  // } else if (req.user.psusrtyp==="MCH"){
  //     //Validation
  //     const { errors, isValid } = prUpdateProfileValidation(req.body, 'C');
  //     if (!isValid) return returnError(req, 400, errors, res);

  //             // Validate Code
  //     let sts = await common.retrieveSpecificGenCodes(req,'USRSTS', req.body.psusrsts);
  //     if (!sts || _.isEmpty(sts.prgedesc)) return returnError(req, 400, { psusrsts: "INVALIDDATAVALUE" }, res);

  //     const t = await connection.sequelize.transaction();
  //     await mcmchpic.findOne({where:{psconunm:req.user.psusrunm},attributes:['psmchuid'],raw:true})
  //     .then(async (mch)=>{
  //         if(mch){
  //             await mcmchpic.update({
  //                 psconnam:req.body.psusrnam,
  //                 psconeml: req.body.psusreml,
  //                 psconphn: req.body.psusrphn,
  //                 psconsts: req.body.psusrsts,
  //             },
  //             {
  //                 where:{psconunm:req.user.psusrunm}
  //             }).then(async ()=>{
  //                 await psusrprf.findOne({where:{psusrunm:req.user.psusrunm},attributes:['psusrunm'],raw:true})
  //                 .then(async(user)=>{
  //                     if(user){
  //                         await psusrprf.update({
  //                             psusrnam:req.body.psusrnam,
  //                             psusreml:req.body.psusreml,
  //                             psusrphn:req.body.psusrphn,
  //                             psusrsts: req.body.psusrsts,
  //                         },
  //                         {
  //                             where:{psusrunm:req.user.psusrunm}
  //                         }).then(async()=>{
  //                             common.writeMntLog('mcmchpic',mch,await mcmchpic.findByPk(mch.id,{raw:true}),mch.psmchuid,'C',req.user.psusrunm )
  //                             common.writeMntLog('psusrprf',user,await psusrprf.findByPk(user.id,{raw:true}),user.psusrunm,'C',req.user.psusrunm )
  //                             await t.commit();
  //                             return returnSuccessMessage(req, 200, "RECORDUPDATED",res)
  //                         })
  //                     }else{
  //                         await t.rollback()
  //                         return returnError(req,500,"USERNOTFOUND",res)
  //                     }
  //                 })
  //             })
  //         }
  //         else{
  //             await t.rollback()
  //             return returnError(req,500,"USERNOTFOUND",res)
  //         }
  //     })

  // }

  // else
  if (req.user.psusrtyp === "ADM") {
    //Validation
    const { errors, isValid } = prUpdateProfileValidation(req.body, "C");
    if (!isValid) return returnError(req, 400, errors, res);
    // Validate Code
    let sts = await common.retrieveSpecificGenCodes(
      req,
      "USRSTS",
      req.body.psusrsts
    );
    if (!sts || _.isEmpty(sts.prgedesc))
      return returnError(req, 400, { psusrsts: "INVALIDDATAVALUE" }, res);

    // Validate Code
    // let dsc = await common.retrieveSpecificGenCodes(req,'YESORNO', req.body.psredind);
    // if (!dsc || _.isEmpty(dsc.prgedesc)) return returnError(req, 400, { psredind: "INVALIDDATAVALUE" }, res);

    await psusrprf
      .findOne({
        where: {
          psusrunm: req.user.psusrunm,
        },
        raw: true,
        attributes: {
          exclude: ["createdAt", "updatedAt", "crtuser", "mntuser"],
        },
      })
      .then(async (user) => {
        if (!user)
          return returnError(req, 400, { psusrunm: "USERNOTFOUND" }, res);

        let obj = req.body;

        obj.mntuser = req.user.psusrunm;

        const new_psusrprf = {
          psusrunm: obj.psusrunm,
          psusrnam: obj.psusrnam,
          psusreml: obj.psusreml,
          psusrsts: obj.psusrsts,
          psusrphn: obj.psusrphn,
          // psredind: obj.psredind
        };

        await psusrprf
          .update(new_psusrprf, {
            where: {
              id: user.id,
            },
          })
          .then(async (update) => {
            common.writeMntLog(
              "psusrprf",
              update,
              await psusrprf.findOne({
                where: { psusrunm: user.psusrunm },
                raw: true,
              }),
              user.psusrunm,
              "C",
              user.psusrunm
            );
            return returnSuccessMessage(req, 200, "USERUPDATED", res);
          })
          .catch((err) => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
          });
      })
      .catch((err) => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      });
  } else {
    return returnError(req, 500, "INVALIDAUTHORITY", res);
  }
};

// Internal Function
async function searchFunction(req, item, selected, counter) {
  return new Promise(async (resolve, reject) => {
    let formatted = {
      actions: [],
    };
    let result = "";
    for (let k = 0; k < counter; k++) {
      let obj = selected[k] || {};
      formatted.function = item.prfuncde;
      formatted.functiondsc = item.prfunnme;
      formatted.functionlds = item.prfunlnm;

      if (item.prfuncde == obj.pracsfun) {
        formatted.checked = true;
      }

      if (obj.pracsfun && formatted.function == obj.pracsfun)
        result = await formatAction(item, obj);

      //Format Actions
      let formatted_result = [];
      for (var l = 0; l < result.length; l++) {
        let obj = result[l];

        let funact = await common.retrieveSpecificGenCodes(
          req,
          "FUNACT",
          obj.key
        );
        funact ? (funact.prgedesc ? (obj.label = funact.prgedesc) : "") : "";
        formatted_result.push(obj);
      }
      formatted.actions = formatted_result;
    }
    return resolve(formatted);
    // return resolve({ checked: false });
  });
}

async function formatAction(item, selected) {
  return new Promise((resolve, reject) => {
    let result = [];
    if (item.prfuna01) {
      result.push({
        field: "pracsa01",
        key: item.prfunl01,
        label: item.prfunl01,
        checked: selected.pracsa01 ? 1 : 0,
      });
    }
    if (item.prfuna02) {
      result.push({
        field: "pracsa02",
        key: item.prfunl02,
        label: item.prfunl02,
        checked: selected.pracsa02 ? 1 : 0,
      });
    }
    if (item.prfuna03) {
      result.push({
        field: "pracsa03",
        key: item.prfunl03,
        label: item.prfunl03,
        checked: selected.pracsa03 ? 1 : 0,
      });
    }
    if (item.prfuna04) {
      result.push({
        field: "pracsa04",
        key: item.prfunl04,
        label: item.prfunl04,
        checked: selected.pracsa04 ? 1 : 0,
      });
    }
    if (item.prfuna05) {
      result.push({
        field: "pracsa05",
        key: item.prfunl05,
        label: item.prfunl05,
        checked: selected.pracsa05 || 0,
      });
    }
    if (item.prfuna06) {
      result.push({
        field: "pracsa06",
        key: item.prfunl06,
        label: item.prfunl06,
        checked: selected.pracsa06 || 0,
      });
    }
    if (item.prfuna07) {
      result.push({
        field: "pracsa07",
        key: item.prfunl07,
        label: item.prfunl07,
        checked: selected.pracsa07 || 0,
      });
    }
    if (item.prfuna08) {
      result.push({
        field: "pracsa08",
        key: item.prfunl08,
        label: item.prfunl08,
        checked: selected.pracsa08 || 0,
      });
    }
    if (item.prfuna09) {
      result.push({
        field: "pracsa09",
        key: item.prfunl09,
        label: item.prfunl09,
        checked: selected.pracsa09 || 0,
      });
    }
    if (item.prfuna10) {
      result.push({
        field: "pracsa10",
        key: item.prfunl10,
        label: item.prfunl10,
        checked: selected.pracsa10 || 0,
      });
    }
    return resolve(result);
  });
}

// controllers/psusrprfController.js

exports.checkUsername = async (req, res) => {
  try {
    const username = req.body.username;
console.log("username", username);
    if (!username) {
      return returnError(req, 400, "RECORDISREQUIRED", res);
    }

    const user = await psusrprf.findOne({
      where: { psusrunm: username },
      attributes: ["psusrunm"], // Only return necessary fields
    });

    return returnSuccess(200, { exist: !!user }, res);
  } catch (error) {
    console.error("Error checking username:", error);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};


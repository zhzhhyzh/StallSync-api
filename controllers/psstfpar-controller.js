// Import
const db = require("../models");
const _ = require("lodash");
const fs = require("fs");


// Table File
const psstfpar = db.psstfpar;
const psusrprf = db.psusrprf;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");
const general = require("../common/general");
const connection = require("../common/db");


// Input Validation
const validatePsstfparInput = require("../validation/psstfpar-validation");
const genConfig = require("../constant/generalConfig");


exports.list = async (req, res) => {
  let limit = 10;
  if (req.query.limit) limit = req.query.limit;

  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * parseInt(limit);

  let option = {
    [Op.and]: []
  };

  if (req.query.psstftyp && !_.isEmpty(req.query.psstftyp)) {
    option[Op.and].push({ psstftyp: req.query.psstftyp });
  }
  if (req.query.psstfsts && !_.isEmpty(req.query.psstfsts)) {
    option[Op.and].push({ psstfsts: req.query.psstfsts });
  }
  if (req.query.psstfnat && !_.isEmpty(req.query.psstfnat)) {
    option[Op.and].push({ psstfnat: req.query.psstfnat });
  }
  if (req.query.search && !_.isEmpty(req.query.search)) {
    option[Op.and].push({
      [Op.or]: [
        { psstfuid: { [Op.eq]: req.query.search } },
        { psstfuid: { [Op.like]: `%${req.query.search}%` } },
        { psstfnme: { [Op.eq]: req.query.search } },
        { psstfnme: { [Op.like]: `%${req.query.search}%` } }
      ]
    });
  }



  const { count, rows } = await psstfpar.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psstfuid", "id"],
      "psstfuid",
      "psstfnme",
      "psstftyp",
      "psstfnat",
      "psstfjdt",
      "psstfsts",
    ],
    order: [["psstfuid", "asc"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];

    if (!_.isEmpty(obj.psstfnat)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "NATION",
        obj.psstfnat
      );
      obj.psstfnatdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }
    if (!_.isEmpty(obj.psstftyp)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "STAFFTYP",
        obj.psstftyp
      );
      obj.psstftypdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }


    if (!_.isEmpty(obj.psstfsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "YESORNO",
        obj.psstfsts
      );
      obj.psstfstsdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }
    obj.psstfjdt = await common.formatDate(obj.psstfjdt, "/")
    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psstfpar", key: ["psstfuid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.findOne = async (req, res) => {
  const id = req.query.id ? req.query.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
  psstfpar
    .findOne({ where: { psstfuid: id }, raw: true })
    .then(async (obj) => {
      if (obj) {
        if (!_.isEmpty(obj.psstfnat)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "NATION",
            obj.psstfnat
          );
          obj.psstfnatdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }
        if (!_.isEmpty(obj.psstftyp)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "STAFFTYP",
            obj.psstftyp
          );
          obj.psstftypdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }

        if (!_.isEmpty(obj.psstfidt)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "IDTYPE",
            obj.psstfidt
          );
          obj.psstfidtdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }
        if (!_.isEmpty(obj.psstfbnk)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "BANK",
            obj.psstfbnk
          );
          obj.psstfbnkdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }
        if (!_.isEmpty(obj.psstfepr)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "HPPRE",
            obj.psstfepr
          );
          obj.psstfeprdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }
        if (!_.isEmpty(obj.psstfsts)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            obj.psstfsts
          );
          obj.psstfstsdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }
        if (!_.isEmpty(obj.psstfsam)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            obj.psstfsam
          );
          obj.psstfsamdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }

        let username = await psusrprf.findOne({
          where: {
            psusrunm: obj.psusrunm
          }, raw: true, attributes: ['psusrunm', 'psusrnam']
        });
        obj.psusrnam = username ? username.psusrnam : "";

        return returnSuccess(200, obj, res);
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.create = async (req, res) => {
  //Validation
  const { errors, isValid } = validatePsstfparInput(req.body, "A");
  if (!isValid) return returnError(req, 400, errors, res);

  // // Generate Code
  // let code = await common.getNextRunning("TRN");
  // let initial = "TRN-"
  // let reference = initial;
  // reference += _.padStart(code, 6, '0');

  // Image Validation
  if (!_.isEmpty(req.body.psstfprp)) {
    let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psstfprp);
    if (!img_exist) return returnError(req, 400, { psstfprp: "INVALIDDATAVALUE" }, res);
  }
  //Check Username
  let flag = await psusrprf.findOne({
    where: {
      psusrunm: req.body.psusrunm
    }, raw: true, attributes: ['psusrunm', 'psusrnam']
  });

  if (!flag) {
    return returnError(req, 400, { psusrunm: "NORECORDFOUND" }, res)
  }

  //Check format number
  if (req.body.psstfidt === 'IC') {
    const icRegex = /^\d{6}-\d{2}-\d{4}$/;
    if (!icRegex.test(req.body.psstfidn)) {
      return returnError(req, 400, {
        psstfidn: "Invalid format. Example: 900101-01-1234"
      }, res);
    }
  } else if (req.body.psstfidt === 'PS') {
    const psRegex = /^[A-Z]{1,2}\d{7,8}$/;
    if (!psRegex.test(req.body.psstfidn)) {
      return returnError(req, 400, {
        psstfidn: "Invalid format. Example: A12345678 or AB1234567"
      }, res);
    }
  }
  // Duplicate Check
  psstfpar
    .findOne({
      where: {
        psstfidt: req.body.psstfidt,
        psstfidn: req.body.psstfidn,
      },
      raw: true,
    })
    .then(async (trnscd) => {
      if (trnscd)
        return returnError(req, 400, { psstfpar: "RECORDEXISTS" }, res);
      else {
        let ddlErrors = {};
        let err_ind = false;
        let NATION = await common.retrieveSpecificGenCodes(
          req,
          "NATION",
          req.body.psstfnat
        );
        if (!NATION || !NATION.prgedesc) {
          ddlErrors.psstfnat = "INVALIDDATAVALUE";
          err_ind = true;
        }

        let aff1 = await common.retrieveSpecificGenCodes(
          req,
          "STAFFTYP",
          req.body.psstftyp
        );
        if (!aff1 || !aff1.prgedesc) {
          ddlErrors.psstftyp = "INVALIDDATAVALUE";
          err_ind = true;
        }

        let trntype = await common.retrieveSpecificGenCodes(
          req,
          "IDTYPE",
          req.body.psstfidt
        );
        if (!trntype || !trntype.prgedesc) {
          ddlErrors.psstfidt = "INVALIDDATAVALUE";
          err_ind = true;
        }
        let bankname = await common.retrieveSpecificGenCodes(
          req,
          "BANK",
          req.body.psstfbnk
        );
        if (!bankname || !bankname.prgedesc) {
          ddlErrors.psstfbnk = "INVALIDDATAVALUE";
          err_ind = true;
        }
        let cprefix = await common.retrieveSpecificGenCodes(
          req,
          "HPPRE",
          req.body.psstfepr
        );
        if (!cprefix || !cprefix.prgedesc) {
          ddlErrors.psstfepr = "INVALIDDATAVALUE";
          err_ind = true;
        }
        if (!_.isEmpty(req.body.psstfsts)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psstfsts
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psstfsts = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }
        if (!_.isEmpty(req.body.psstfsam)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psstfsam
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psstfsam = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }


        if (err_ind) return returnError(req, 400, ddlErrors, res);
        else {
          const t = await connection.sequelize.transaction();
          let code, initial, reference;

          if (!_.isEmpty(req.body.psstftyp)) {
            switch (req.body.psstftyp) {
              case 'A':
                // Generate Code
                code = await common.getNextRunning("ADM");
                initial = "A"
                reference = initial;
                reference += _.padStart(code, 6, '0');
                break;
              case 'S':
                code = await common.getNextRunning("SFF");
                initial = "S"
                reference = initial;
                reference += _.padStart(code, 6, '0');
                break;
              case 'O':
                code = await common.getNextRunning("OWN");
                initial = "B"
                reference = initial;
                reference += _.padStart(code, 6, '0');
                break;
            }
          }
          psstfpar
            .create({
              psstfuid: reference,
              psstfnme: req.body.psstfnme,
              psmrcuid: req.body.psmrcuid,
              psstftyp: req.body.psstftyp,
              psstfidt: req.body.psstfidt,
              psstfidn: req.body.psstfidn,
              psstfprp: req.body.psstfprp,
              psstfnat: req.body.psstfnat ? req.body.psstfnat : "MY",
              psstfsdt: new Date(),
              psstfjdt: req.body.psstfjdt ? req.body.psstfjdt : new Date(),
              psstfsts: req.body.psstfsts ? req.body.psstfsts : "Y",
              psstfad1: req.body.psstfad1,
              psstfad2: req.body.psstfad2,
              psstfpos: req.body.psstfpos,
              psstfcit: req.body.psstfcit,
              psstfsta: req.body.psstfsta,
              psstfsam: req.body.psstfsam ? req.body.psstfsam : "N",
              psstfha1: req.body.psstfsam == "Y" ? req.body.psstfad1 : req.body.psstfha1,
              psstfha2: req.body.psstfsam == "Y" ? req.body.psstfad2 : req.body.psstfha2,
              psstfhpo: req.body.psstfsam == "Y" ? req.body.psstfpos : req.body.psstfhpo,
              psstfhci: req.body.psstfsam == "Y" ? req.body.psstfcit : req.body.psstfhci,
              psstfhst: req.body.psstfsam == "Y" ? req.body.psstfsta : req.body.psstfhst,
              psstfeml: req.body.psstfeml,
              psstfbnk: req.body.psstfbnk,
              psstfacc: req.body.psstfacc,
              psstfbnm: req.body.psstfbnm,
              psstfepr: req.body.psstfepr,
              psstfehp: req.body.psstfehp,
              psusrunm: req.body.psusrunm,
              psstfchp: req.body.psstfchp,
              crtuser: req.user.psusrunm,
              mntuser: req.user.psusrunm,
            })
            .then(async (data) => {
              let created = data.get({ plain: true });

              if (!_.isEmpty(req.body.psstfprp)) {
                await common
                  .writeImage(
                    genConfig.documentTempPath,
                    genConfig.staffImagePath,
                    created.psstfprp,
                    // uuidv4(),
                    req.user.psusrunm,
                    2,
                    t
                  )
                  .catch(async (err) => {
                    console.log(err);
                    await t.rollback();
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                  });

              }
              t.commit();
              common.writeMntLog(
                "psstfpar",
                null,
                null,
                created.psstfuid,
                "A",
                req.user.psusrunm,
                "", created.psstfuid);
              return returnSuccessMessage(req, 200, "RECORDCREATED", res);
            })
            .catch((err) => {
              console.log(err);
              t.rollback();
              return returnError(req, 500, "UNEXPECTEDERROR", res);
            });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.update = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
  let imageChangeFlag = false;
  //Validation
  const { errors, isValid } = validatePsstfparInput(req.body, "C");
  if (!isValid) return returnError(req, 400, errors, res);

  //Check format number
  if (req.body.psstfidt === 'IC') {
    const icRegex = /^\d{6}-\d{2}-\d{4}$/;
    if (!icRegex.test(req.body.psstfidn)) {
      return returnError(req, 400, {
        psstfidn: "Invalid format. Example: 900101-01-1234"
      }, res);
    }
  } else if (req.body.psstfidt === 'PS') {
    const psRegex = /^[A-Z]{1,2}\d{7,8}$/;
    if (!psRegex.test(req.body.psstfidn)) {
      return returnError(req, 400, {
        psstfidn: "Invalid format. Example: A12345678 or AB1234567"
      }, res);
    }
  }

  await psstfpar
    .findOne({
      where: {
        psstfuid: id,
      },
      raw: true,
      attributes: {
        exclude: ["createdAt", "crtuser", "mntuser"],
      },
    })
    .then(async (data) => {
      if (data) {
        if (!_.isEmpty(req.body.psstfprp) && req.body.psstfprp != data.psstfprp) {
          let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psstfprp);
          if (!img_exist) return returnError(req, 400, { psstfprp: "INVALIDDATAVALUE" }, res);
          imageChangeFlag = !imageChangeFlag;
        }

        let ddlErrors = {};
        let err_ind = false;
        let NATION = await common.retrieveSpecificGenCodes(
          req,
          "NATION",
          req.body.psstfnat
        );
        if (!NATION || !NATION.prgedesc) {
          ddlErrors.psstfnat = "INVALIDDATAVALUE";
          err_ind = true;
        }

        let aff1 = await common.retrieveSpecificGenCodes(
          req,
          "STAFFTYP",
          req.body.psstftyp
        );
        if (!aff1 || !aff1.prgedesc) {
          ddlErrors.psstftyp = "INVALIDDATAVALUE";
          err_ind = true;
        }

        let trntype = await common.retrieveSpecificGenCodes(
          req,
          "IDTYPE",
          req.body.psstfidt
        );
        if (!trntype || !trntype.prgedesc) {
          ddlErrors.psstfidt = "INVALIDDATAVALUE";
          err_ind = true;
        }
        let bankname = await common.retrieveSpecificGenCodes(
          req,
          "BANK",
          req.body.psstfbnk
        );
        if (!bankname || !bankname.prgedesc) {
          ddlErrors.psstfbnk = "INVALIDDATAVALUE";
          err_ind = true;
        }
        let cprefix = await common.retrieveSpecificGenCodes(
          req,
          "HPPRE",
          req.body.psstfepr
        );
        if (!cprefix || !cprefix.prgedesc) {
          ddlErrors.psstfepr = "INVALIDDATAVALUE";
          err_ind = true;
        }
        if (!_.isEmpty(req.body.psstfsts)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psstfsts
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psstfsts = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }
        if (!_.isEmpty(req.body.psstfsam)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psstfsam
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psstfsam = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }


        if (err_ind) return returnError(req, 400, ddlErrors, res);


        if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)
        const t = await connection.sequelize.transaction();


        psstfpar
          .update(
            {
              //  psstfuid: reference,
              psstfnme: req.body.psstfnme,
              psmrcuid: req.body.psmrcuid,
              psstftyp: req.body.psstftyp,
              psstfidt: req.body.psstfidt,
              psstfidn: req.body.psstfidn,
              psstfprp: req.body.psstfprp,
              psstfnat: req.body.psstfnat,
              // psstfsdt: new Date(),
              psstfjdt: req.body.psstfjdt,
              psstfsts: req.body.psstfsts,
              psstfad1: req.body.psstfad1,
              psstfad2: req.body.psstfad2,
              psstfpos: req.body.psstfpos,
              psstfcit: req.body.psstfcit,
              psstfsta: req.body.psstfsta,
              psstfsam: req.body.psstfsam,
              psstfha1: req.body.psstfsam == "Y" ? req.body.psstfad1 : psstfha1,
              psstfha2: req.body.psstfsam == "Y" ? req.body.psstfad2 : psstfha2,
              psstfhpo: req.body.psstfsam == "Y" ? req.body.psstfpos : psstfhpo,
              psstfhci: req.body.psstfsam == "Y" ? req.body.psstfcit : psstfhci,
              psstfhst: req.body.psstfsam == "Y" ? req.body.psstfsta : psstfhst,
              psstfeml: req.body.psstfeml,
              psstfbnk: req.body.psstfbnk,
              psstfacc: req.body.psstfacc,
              psstfbnm: req.body.psstfbnm,
              psstfepr: req.body.psstfepr,
              psstfehp: req.body.psstfehp,
              // psusrunm: req.body.psusrunm,

              mntuser: req.user.psusrunm,
            },
            {
              where: {
                psstfuid: id,
              },
            }
          )
          .then(async () => {
            if (imageChangeFlag) {
              if (fs.existsSync(genConfig.staffImagePath + data.psstfprp)) {
                fs.unlinkSync(genConfig.staffImagePath + data.psstfprp);
              }

              await common
                .writeImage(
                  genConfig.documentTempPath,
                  genConfig.staffImagePath,
                  req.body.psstfprp,
                  // uuidv4(),
                  req.user.psusrunm,
                  2,
                  t
                )
                .catch(async (err) => {
                  console.log(err);
                  await t.rollback();
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }
            t.commit();
            common.writeMntLog(
              "psstfpar",
              data,
              await psstfpar.findByPk(data.id, { raw: true }),
              data.psstfuid,
              "C",
              req.user.psusrunm
            );
            return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
          }).catch(async (err) => {
            console.log("This is the unexpected error when updating", err);
            await t.rollback();
            return returnError(req, 500, "UNEXPECTEDERROR", res);
          });
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch(async (err) => {
      console.log("This is the unexpected error before update perform", err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.delete = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
  let imamgeExist = false;
  const t = await connection.sequelize.transaction();

  await psstfpar
    .findOne({
      where: {
        psstfuid: id,
      },
      raw: true
    })
    .then((trnscd) => {
      if (trnscd.psstfprp) {
        imamgeExist = !imamgeExist;
      }
      if (trnscd) {
        psstfpar
          .destroy({
            where: { psstfuid: id },
          })
          .then(async () => {
            if (imamgeExist) {
              try {
                // Remove Image
                if (fs.existsSync(genConfig.staffImagePath + trnscd.psstfprp)) {
                  fs.unlinkSync(genConfig.staffImagePath + trnscd.psstfprp);
                }
              } catch (err) {
                console.log("Remove Image Error :", err);
                await t.rollback();
                return returnError(req, 500, "UNEXPECTEDERROR", res);
              }
            }
            t.commit();
            common.writeMntLog(
              "psstfpar",
              null,
              null,
              trnscd.psstfuid,
              "D",
              req.user.psusrunm,
              "",
              trnscd.psstfuid
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
      t.rollback();
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

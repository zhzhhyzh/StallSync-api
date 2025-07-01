// Import
const db = require("../models");
const _ = require("lodash");

// Table File
const psrwdpar = db.psrwdpar;
const psrwddtl = db.psrwddtl;
const psmrcpar = db.psmrcpar;
const psordpar = db.psordpar;
const psmbrprf = db.psmbrprf;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");
const general = require("../common/general");
const connection = require("../common/db");

// Input Validation
const validatePsrwdparInput = require("../validation/psrwdpar-validation");
const { where } = require("sequelize");

exports.list = async (req, res) => {
  let limit = 10;
  if (req.query.limit) limit = req.query.limit;

  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * parseInt(limit);

  let option = {};

  if (req.query.search && !_.isEmpty(req.query.search)) {
    option = {
      [Op.or]: [
        { psrwduid: { [Op.eq]: req.query.search } },
        { psrwduid: { [Op.like]: "%" + req.query.search + "%" } },
        { psrwdnme: { [Op.eq]: req.query.search } },
        { psrwdnme: { [Op.like]: "%" + req.query.search + "%" } },
        { psrwddsc: { [Op.eq]: req.query.search } },
        { psrwddsc: { [Op.like]: "%" + req.query.search + "%" } },
      ],
    };
  }

  if (req.query.psrwdsts && !_.isEmpty(req.query.psrwdsts)) {
    option.psrwdsts = req.query.psrwdsts;
  }

  if (req.query.psrwdtyp && !_.isEmpty(req.query.psrwdtyp)) {
    option.psrwdtyp = req.query.psrwdtyp;
  }


  const { count, rows } = await psrwdpar.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psrwduid", "id"],
      "psrwduid",
      "psrwdnme",
      "psrwddsc",
      "psrwdsts",
      "psrwdtyp",

      "psrwdqty",

    ],
    order: [["id", "asc"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];

    if (!_.isEmpty(obj.psrwdtyp)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "DISTYPE",
        obj.psrwdtyp
      );
      obj.psrwdtypdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }
    if (!_.isEmpty(obj.psrwdsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "RWDSTS",
        obj.psrwdsts
      );
      obj.psrwdstsdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(obj.psrwdism)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "YESORNO",
        obj.psrwdism
      );
      obj.psrwdismdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }
    if (!_.isEmpty(obj.psrwdica)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "YESORNO",
        obj.psrwdica
      );
      obj.psrwdicadsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }
    if (!_.isEmpty(obj.psrwdaam)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "YESORNO",
        obj.psrwdaam
      );
      obj.psrwdaamdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }
    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psrwdpar", key: ["psrwduid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.findOne = async (req, res) => {
  const id = req.query.id ? req.query.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
  psrwdpar
    .findOne({ where: { psrwduid: id }, raw: true })
    .then(async (obj) => {
      if (obj) {
        const { count, rows } = await psrwddtl.findAndCountAll({
          where: {
            psrwduid: obj.psrwduid
          }, raw: true, attributes: ['psrwduid', 'psmrcuid']
        });
        let existing = count == 0 ? [] : rows.map(exist => exist.psmrcuid);
        obj.psrwddtl = existing;
        if (!_.isEmpty(obj.psrwdtyp)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "DISTYPE",
            obj.psrwdtyp
          );
          obj.psrwdtypdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }
        if (!_.isEmpty(obj.psrwdsts)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "RWDSTS",
            obj.psrwdsts
          );
          obj.psrwdstsdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }

        if (!_.isEmpty(obj.psrwdism)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            obj.psrwdism
          );
          obj.psrwdismdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }
        if (!_.isEmpty(obj.psrwdica)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            obj.psrwdica
          );
          obj.psrwdicadsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }
        if (!_.isEmpty(obj.psrwdaam)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            obj.psrwdaam
          );
          obj.psrwdaamdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }

        // return returnSuccess(200, obj, res);
            return returnSuccess(200, { data: obj }, res);
        
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.create = async (req, res) => {
  //Validation
  const { errors, isValid } = validatePsrwdparInput(req.body, "A");
  if (!isValid) return returnError(req, 400, errors, res);

  // Duplicate Check
  psrwdpar
    .findOne({
      where: {
        psrwduid: req.body.psrwduid,
      },
      raw: true,
    })
    .then(async (trnscd) => {
      if (trnscd)
        return returnError(req, 400, { psrwdpar: "RECORDEXISTS" }, res);
      else {
        let ddlErrors = {};
        let err_ind = false;
        let DISTYPE = await common.retrieveSpecificGenCodes(
          req,
          "DISTYPE",
          req.body.psrwdtyp
        );
        if (!DISTYPE || !DISTYPE.prgedesc) {
          ddlErrors.psrwdtyp = "INVALIDDATAVALUE";
          err_ind = true;
        }

        let aff1 = await common.retrieveSpecificGenCodes(
          req,
          "RWDSTS",
          req.body.psrwdsts
        );
        if (!aff1 || !aff1.prgedesc) {
          ddlErrors.psrwdsts = "INVALIDDATAVALUE";
          err_ind = true;
        }

        let trntype = await common.retrieveSpecificGenCodes(
          req,
          "YESORNO",
          req.body.psrwdism
        );
        if (!trntype || !trntype.prgedesc) {
          ddlErrors.psrwdism = "INVALIDDATAVALUE";
          err_ind = true;
        }
        if (!_.isEmpty(req.body.psrwdica)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psrwdica
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psrwdica = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }
        if (!_.isEmpty(req.body.psrwdaam)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psrwdaam
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psrwdaam = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }
        const rewardDetail = req.body.psrwddtl;

        for (let i = 0; i < rewardDetail.length; i++) {
          if (rewardDetail[i].length > 25) {
            return returnError(req, 400, { rewardDetail: "INVALIDVALUELENGTH&25" }, res)
          }
          let check = await psmrcpar.findOne({
            where: {
              psmrcuid: rewardDetail[i]
            }, raw: true, attributes: ["psmrcuid", "psmrcnme"]
          });
          if (!check && _.isEmpty(check.psmrcnme)) {
            return returnError(req, 400, { rewardDetail: "INVALIDDATAVALUE" }, res)

          }
        }

        if (err_ind) return returnError(req, 400, ddlErrors, res);


        else {

          const fromDate = new Date(req.body.psrwdfdt);
          const toDate = new Date(req.body.psrwdtdt);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // normalize time

          // Determine reward status
          let status = "I"; // default to 'Incoming'
          if (fromDate <= today && today <= toDate) {
            status = "A"; // Active
          }
          const t = await connection.sequelize.transaction();

          psrwdpar
            .create({
              psrwduid: req.body.psrwduid,
              psrwdnme: req.body.psrwdnme,
              psrwddsc: req.body.psrwddsc,
              psrwdlds: req.body.psrwdlds,
              psrwdfdt: req.body.psrwdfdt,
              psrwdtdt: req.body.psrwdtdt,
              psrwdtyp: req.body.psrwdtyp,
              psrwddva: req.body.psrwddva,
              psrwdism: req.body.psrwdism,
              psrwdmin: req.body.psrwdmin,
              psrwdcap: req.body.psrwdcap,
              psrwdica: req.body.psrwdica,
              psrwdaam: req.body.psrwdaam,
              psrwdsts: status,
              psrwdqty: req.body.psrwdqty,

              crtuser: req.user.psusrunm,
              mntuser: req.user.psusrunm,
            }, { transaction: t })
            .then(async (data) => {
              let created = data.get({ plain: true });
              for (let i = 0; i < rewardDetail.length; i++) {
                await psrwddtl.create({
                  psrwduid: req.body.psrwduid,
                  psmrcuid: rewardDetail[i]
                })
              }
              common.writeMntLog(
                "psrwdpar",
                null,
                null,
                created.psrwduid,
                "A",
                req.user.psusrunm,
                "", created.psrwduid);

              for (let i = 0; i < rewardDetail.length; i++) {
                common.writeMntLog(
                  "psrwddtl",
                  null,
                  null,
                  created.psrwduid + "-" + rewardDetail[i],
                  "A",
                  req.user.psusrunm,
                  "", created.psrwduid + "-" + rewardDetail[i]);

              }
              await t.commit();
              return returnSuccessMessage(req, 200, "RECORDCREATED", res);

            })
            .catch(async (err) => {
              console.log(err);
              await t.rollback();
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

  //Validation
  const { errors, isValid } = validatePsrwdparInput(req.body, "C");
  if (!isValid) return returnError(req, 400, errors, res);

  await psrwdpar
    .findOne({
      where: {
        psrwduid: id,
      },
      raw: true,
      attributes: {
        exclude: ["createdAt", "crtuser", "mntuser"],
      },
    })
    .then(async (data) => {
      if (data) {
        if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

        let ddlErrors = {};
        let err_ind = false;
        let DISTYPE = await common.retrieveSpecificGenCodes(
          req,
          "DISTYPE",
          req.body.psrwdtyp
        );
        if (!DISTYPE || !DISTYPE.prgedesc) {
          ddlErrors.psrwdtyp = "INVALIDDATAVALUE";
          err_ind = true;
        }

        let aff1 = await common.retrieveSpecificGenCodes(
          req,
          "RWDSTS",
          req.body.psrwdsts
        );
        if (!aff1 || !aff1.prgedesc) {
          ddlErrors.psrwdsts = "INVALIDDATAVALUE";
          err_ind = true;
        }


        let trntype = await common.retrieveSpecificGenCodes(
          req,
          "YESORNO",
          req.body.psrwdism
        );
        if (!trntype || !trntype.prgedesc) {
          ddlErrors.psrwdism = "INVALIDDATAVALUE";
          err_ind = true;
        }
        if (!_.isEmpty(req.body.psrwdica)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psrwdica
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psrwdica = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }
        if (!_.isEmpty(req.body.psrwdaam)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psrwdaam
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psrwdaam = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }



        if (err_ind) return returnError(req, 400, ddlErrors, res);
        const t = await connection.sequelize.transaction();

        const rewardDetail = req.body.psrwddtl;
        for (let i = 0; i < rewardDetail.length; i++) {
          if (rewardDetail[i].length > 25) {
            return returnError(req, 400, { rewardDetail: "INVALIDVALUELENGTH&25" }, res)
          }
          let check = await psmrcpar.findOne({
            where: {
              psmrcuid: rewardDetail[i]
            }, raw: true, attributes: ["psmrcuid", "psmrcnme"]
          })
          if (!check && _.isEmpty(check.psmrcnme)) {
            return returnError(req, 400, { rewardDetail: "INVALIDDATAVALUE" }, res)

          }
        }

        const existingTypes = await psrwddtl.findAll({
          where: { psrwduid: id },
          attributes: ["psmrcuid"],
          raw: true
        });

        // Convert to arrays for easier comparison
        const existing = existingTypes.map(exist => exist.psmrcuid);

        //Types to create
        const toCreate = rewardDetail.filter(t => !existing.includes(t));

        //Types to delete
        const toDelete = existing.filter(t => !rewardDetail.includes(t));



        const fromDate = new Date(req.body.psrwdfdt);
        const toDate = new Date(req.body.psrwdtdt);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize time

        // Determine reward status
        let status = "I"; // default to 'Incoming'
        if (fromDate <= today && today <= toDate) {
          status = "A"; // Active
        }

        psrwdpar
          .update(
            {
              //  psrwduid: req.body.psrwduid,
              psrwdnme: req.body.psrwdnme,
              psrwddsc: req.body.psrwddsc,
              psrwdlds: req.body.psrwdlds,
              psrwdfdt: req.body.psrwdfdt,
              psrwdtdt: req.body.psrwdtdt,
              psrwdtyp: req.body.psrwdtyp,
              psrwddva: req.body.psrwddva,
              psrwdism: req.body.psrwdism,
              psrwdmin: req.body.psrwdmin,
              psrwdcap: req.body.psrwdcap,
              psrwdica: req.body.psrwdica,
              psrwdaam: req.body.psrwdaam,
              psrwdsts: status,
              psrwdqty: req.body.psrwdqty,

              mntuser: req.user.psusrunm,
            },
            {
              where: {
                psrwduid: data.psrwduid,
              },
            }, { transaction: t }
          )
          .then(async () => {

            for (let i = 0; i < toCreate.length; i++) {
              psrwddtl
                .create({
                  psrwduid: id,
                  psmrcuid: toCreate[i],

                }).catch(async (err) => {
                  await t.rollback();
                  console.log("Error when creating Reward Detail: ", err);
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }

            for (let i = 0; i < toDelete.length; i++) {
              psrwddtl
                .destroy({
                  where: {
                    psrwduid: id,
                    psmrcuid: toDelete[i],
                  }
                }).catch(async (err) => {
                  await t.rollback();
                  console.log("Error when deleting Reward Detail: ", err);
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }


            await t.commit();

            common.writeMntLog(
              "psrwdpar",
              data,
              await psrwdpar.findOne({ where: { psrwduid: id }, raw: true }),
              data.psrwduid,
              "C",
              req.user.psusrunm
            );
            for (let i = 0; i < toCreate.length; i++) {
              common.writeMntLog(
                "psrwddtl",
                null,
                null,
                data.psrwduid + "-" + toCreate[i],
                "A",
                req.user.psusrunm,
                "", data.psrwduid + "-" + toCreate[i]);
            }
            for (let i = 0; i < toDelete.length; i++) {
              common.writeMntLog(
                "psrwddtl",
                null,
                null,
                data.psrwduid + "-" + toDelete[i],
                "D",
                req.user.psusrunm,
                "",
                data.psrwduid + "-" + toDelete[i],

              );
            }
            return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
          }).catch(async (err) => {
            console.log(err);
            await t.rollback();
            return returnError(req, 500, "UNEXPECTEDERROR", res);
          });
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.delete = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
  const t = await connection.sequelize.transaction();

  await psrwdpar
    .findOne({
      where: {
        psrwduid: id,
      },
      raw: true,
    })
    .then((trnscd) => {
      if (trnscd) {
        psrwdpar
          .destroy({
            where: { id: trnscd.id },
          }, { transaction: t })
          .then(async () => {
            await psrwddtl.findAll({
              where: {
                psrwduid: id
              }, raw: true, attributes: ["psmrctyp"]
            }).then(async (merchantTypes) => {
              const existing = merchantTypes.map(exist => exist.psmrctyp);
              await psrwddtl.destroy({
                where: {
                  psrwduid: id
                }
              });

              common.writeMntLog(
                "psrwdpar",
                null,
                null,
                trnscd.psrwduid,
                "D",
                req.user.psusrunm,
                "",
                trnscd.psrwduid
              );
              for (let i = 0; i < existing.length; i++) {
                common.writeMntLog(
                  "psrwddtl",
                  null,
                  null,
                  trnscd.psrwduid + "-" + existing[i],
                  "D",
                  req.user.psusrunm,
                  "",
                  trnscd.psrwduid + "-" + existing[i],

                );
              }
              return returnSuccessMessage(req, 200, "RECORDDELETED", res);
            })
              .catch(async (err) => {
                console.log(err);
                await t.rollback();
                return returnError(req, 500, "UNEXPECTEDERROR", res);
              });
          })
          .catch(async (err) => {
            console.log(err);
            await t.rollback();
            return returnError(req, 500, "UNEXPECTEDERROR", res);
          });
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};


//List redemption

exports.listRdmp = async (req, res) => {
  const id = req.query.id ? req.query.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  let limit = 10;
  if (req.query.limit) limit = req.query.limit;

  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * parseInt(limit);

  let option = {};



  if (req.query.from && !_.isEmpty("" + req.query.from)) {
    let fromDate = new Date(req.query.from);
    fromDate.setHours(0, 0, 0, 0);
    if (!_.isNaN(fromDate.getTime())) {
      if (req.query.to && !_.isEmpty("" + req.query.to)) {
        let toDate = new Date(req.query.to);
        toDate.setHours(23, 59, 59, 999);
        if (!_.isNaN(toDate.getTime())) {
          option.psordodt = {
            [Op.and]: [{ [Op.gte]: fromDate }, { [Op.lte]: toDate }],
          };
        } else {
          option.psordodt = {
            [Op.gte]: fromDate,
          };
        }
      } else {
        option.psordodt = {
          [Op.gte]: fromDate,
        };
      }
    }
  } else if (req.query.to && !_.isEmpty("" + req.query.to)) {
    let toDate = new Date(req.query.to);
    toDate.setHours(23, 59, 59, 999);
    if (!_.isNaN(toDate.getTime())) {
      option.psordodt = {
        [Op.lte]: toDate,
      };
    }
  }


  option.psrwduid = req.query.id;


  const { count, rows } = await psordpar.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psorduid", "id"],
      "psorduid",
      "psordodt",
      "psmbruid",
    ],
    order: [["id", "asc"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];

    let result = await psmbrprf.findOne({
      where: {
        psmbruid: obj.psmbruid
      }, raw: true, attributes: ["psmbrnam"]
    })

    obj.psmrbnam = result.psmbrnam;

    obj.psordodt = await common.formatDate(obj.psordodt);

    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psordpar", key: ["psorduid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};
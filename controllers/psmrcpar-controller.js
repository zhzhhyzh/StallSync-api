// Import
const db = require("../models");
const _ = require("lodash");
const fs = require("fs");


// Table File
const psmrcpar = db.psmrcpar;
const psmrclbl = db.psmrclbl;
const psusrprf = db.psusrprf;
const prgencde = db.prgencde;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");
const general = require("../common/general");
const connection = require("../common/db");
const genConfig = require("../constant/generalConfig");



// Input Validation
const validatePsmrcparInput = require("../validation/psmrcpar-validation");
const { raw } = require("express");
const { where } = require("sequelize");

exports.list = async (req, res) => {
  let mchId = "";
  if (req.user.psusrtyp == "MCH") {
    mchId = req.user.psmrcuid;
  }
  let limit = 10;
  if (req.query.limit) limit = req.query.limit;

  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * parseInt(limit);

  let option = {
    [Op.and]: []
  };
  if (mchId != "") {
    option[Op.and].push({ psmrcuid: mchId })
  }

  if (req.query.psmrcsts && !_.isEmpty(req.query.psmrcsts)) {
    option[Op.and].push({ psmrcsts: req.query.psmrcsts });
  }

  if (req.query.search && !_.isEmpty(req.query.search)) {
    option[Op.and].push({
      [Op.or]: [
        { psmrcuid: { [Op.eq]: req.query.search } },
        { psmrcuid: { [Op.like]: `%${req.query.search}%` } },
        { psmrcnme: { [Op.eq]: req.query.search } },
        { psmrcnme: { [Op.like]: `%${req.query.search}%` } }
      ]
    });
  }



  const { count, rows } = await psmrcpar.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psmrcuid", "id"],
      "psmrcuid",
      "psmrcnme",
      "psmrcdsc",
      "psmrcjdt",
      "psmrcown",
      "psmrcsts",
      "psmrcrtg",
      "psmrcsfi"
    ],
    order: [["psmrcuid", "asc"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];


    if (!_.isEmpty(obj.psmrcsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "YESORNO",
        obj.psmrcsts
      );
      obj.psmrcstsdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    // if (!_.isEmpty(obj.psmrcrtg)) {
    obj.psmrcrtg = await common.formatDecimal(obj.psmrcrtg);
    // } else{
    //   obj.psmrcrtg = 0
    // }

    // if (!_.isEmpty(obj.psmrcjdt)) {
    obj.psmrcjdt = await common.formatDate(obj.psmrcjdt, '/');
    // }


    // if (!_.isEmpty(obj.psmrcown)) {
    let result = await psusrprf.findOne({
      where: { psusrunm: obj.psmrcown },
      raw: true,
      attributes: ["psusrnam"]
    });
    obj.psmrcowndsc = result?.psusrnam ?? "-";

    // }

    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psmrcpar", key: ["psmrcuid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.findOne = async (req, res) => {
  const id = req.query.id ? req.query.id : "";
  if (id === "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  try {
    const obj = await psmrcpar.findOne({ where: { psmrcuid: id }, raw: true });

    if (!obj) return returnError(req, 500, "NORECORDFOUND", res);

    const merchantTypes = await psmrclbl.findAll({
      where: { psmrcuid: id },
      raw: true,
      attributes: ['psmrcuid', 'psmrctyp']
    });

    const psmrclblArray = [];

    for (const item of merchantTypes) {
      const type = item.psmrctyp;

      if (!_.isEmpty(type)) {
        const description = await common.retrieveSpecificGenCodes(req, "MRCTYP", type);
        psmrclblArray.push({
          key: type,
          label: description?.prgedesc || ""
        });
      }
    }
    obj.psmrclbl = psmrclblArray;



    let avl_mrclbl = [];
    const excludedKeys = psmrclblArray.map(item => item.key);

    avl_mrclbl = await prgencde.findAll({
      where: {
        prgtycde: "MRCTYP",
        prgecode: {
          [Op.notIn]: excludedKeys
        }
      },
      raw: true,
      attributes: [['prgecode', 'key'], ['prgedesc', 'label']]
    });


    if (!_.isEmpty(obj.psmrcbnk)) {
      const description = await common.retrieveSpecificGenCodes(req, "BANK", obj.psmrcbnk);
      obj.psmrcbnkdsc = description?.prgedesc || "";
    }

    if (!_.isEmpty(obj.psmrcsts)) {
      const description = await common.retrieveSpecificGenCodes(req, "YESORNO", obj.psmrcsts);
      obj.psmrcstsdsc = description?.prgedesc || "";
    }
    obj.psavllbl = avl_mrclbl
    return returnSuccess(200, obj, res);
  } catch (err) {
    console.error(err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};


exports.create = async (req, res) => {
  //Validation
  const { errors, isValid } = validatePsmrcparInput(req.body, "A");
  if (!isValid) return returnError(req, 400, errors, res);

  let storeFront, profilePic = false;
  let img_exist2 = fs.existsSync(genConfig.documentTempPath + req.body.psmrcssc);
  if (!img_exist2) return returnError(req, 400, { psmrcssc: "INVALIDDATAVALUE" }, res);
  if (!_.isEmpty(req.body.psmrcsfi)) {
    let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psmrcsfi);
    if (!img_exist) return returnError(req, 400, { psmrcsfi: "INVALIDDATAVALUE" }, res);
    storeFront = !storeFront;
  }
  if (!_.isEmpty(req.body.psmrcppi)) {
    let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psmrcppi);
    if (!img_exist) return returnError(req, 400, { psmrcppi: "INVALIDDATAVALUE" }, res);
    profilePic = !profilePic;
  }


  if (!_.isEmpty(req.body.psmrcown)) {
    //Check Username
    let flag = await psusrprf.findOne({
      where: {
        psusrunm: req.body.psmrcown
      }, raw: true, attributes: ['psusrunm', 'psusrnam']
    });

    if (!flag) {
      return returnError(req, 400, { psusrunm: "NORECORDFOUND" }, res)
    }

  }

  // if (req.body.psmrcssm && !isValidNumericString(req.body.psmrcssm)) {
  //   return returnError(req, 400, { psmrcssm: "SSM No. only allow number" }, res)
  // }

  if (req.body.psmrcacc && !isValidNumericString(req.body.psmrcacc)) {
    return returnError(req, 400, { psmrcacc: "Bank Account No. only allow number" }, res)
  }
  // Duplicate Check
  psmrcpar
    .findOne({
      where: {
        psmrcuid: req.body.psmrcuid,
      },
      raw: true,
    })
    .then(async (trnscd) => {
      if (trnscd)
        return returnError(req, 400, { psmrcuid: "RECORDEXISTS" }, res);
      else {
        let ddlErrors = {};
        let err_ind = false;

        let psmrclblT = req.body.psmrclbl;
        for (let i = 0; i < psmrclblT.length; i++) {

          let aff1 = await common.retrieveSpecificGenCodes(
            req,
            "MRCTYP",
            psmrclblT[i]
          );
          if (!aff1 || !aff1.prgedesc) {
            ddlErrors.psmrclblT[i] = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }


        let bankname = await common.retrieveSpecificGenCodes(
          req,
          "BANK",
          req.body.psmrcbnk
        );
        if (!bankname || !bankname.prgedesc) {
          ddlErrors.psmrcbnk = "INVALIDDATAVALUE";
          err_ind = true;
        }

        if (!_.isEmpty(req.body.psmrcsts)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psmrcsts
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psmrcsts = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }



        if (err_ind) return returnError(req, 400, ddlErrors, res);
        else {
          const t = await connection.sequelize.transaction();
          psmrcpar
            .create({
              psmrcnme: req.body.psmrcnme,
              psmrcuid: req.body.psmrcuid,
              psmrcdsc: req.body.psmrcdsc,
              psmrclds: req.body.psmrclds,
              psmrcsdt: new Date(),
              psmrcjdt: req.body.psmrcjdt ? req.body.psmrcjdt : new Date(),
              psmrcown: req.body.psmrcown,
              psmrcssm: req.body.psmrcssm,
              psmrcssc: req.body.psmrcssc,
              psmrcsts: req.body.psmrcsts ? req.body.psmrcsts : "Y",
              psmrcbnk: req.body.psmrcbnk,
              psmrcacc: req.body.psmrcacc,
              psmrcsfi: req.body.psmrcsfi,
              psmrcppi: req.body.psmrcppi,
              psmrcrtg: 0,
              psmrcrtc: 0,

              psmrcrmk: req.body.psmrcrmk,
              psmrcbnm: req.body.psmrcbnm,
              // psmrctyp: req.body.psmrctyp,
              crtuser: req.user.psusrunm,
              mntuser: req.user.psusrunm,
            }, { transaction: t })
            .then(async (data) => {
              let created = data.get({ plain: true });
              for (let i = 0; i < psmrclblT.length; i++) {
                await psmrclbl
                  .create({
                    psmrcuid: req.body.psmrcuid,
                    psmrctyp: psmrclblT[i],

                  })

              }
              await common
                .writeImage(
                  genConfig.documentTempPath,
                  genConfig.ssmImagePath,
                  created.psmrcssc,
                  // uuidv4(),
                  req.user.psusrunm,
                  4,

                )
                .catch(async (err) => {
                  console.log(err);
                  await t.rollback();
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });

              if (storeFront) {
                await common
                  .writeImage(
                    genConfig.documentTempPath,
                    genConfig.merchantImagePath,
                    created.psmrcsfi,
                    // uuidv4(),
                    req.user.psusrunm,
                    3,

                  )
                  .catch(async (err) => {
                    console.log(err);
                    await t.rollback();
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                  });

              }
              if (profilePic) {
                await common
                  .writeImage(
                    genConfig.documentTempPath,
                    genConfig.merchantImagePath,
                    created.psmrcppi,
                    // uuidv4(),
                    req.user.psusrunm,
                    3,

                  )
                  .catch(async (err) => {
                    console.log(err);
                    await t.rollback();
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                  });

              }
              t.commit();

              common.writeMntLog(
                "psmrcpar",
                null,
                null,
                created.psmrcuid,
                "A",
                req.user.psusrunm,
                "", created.psmrcuid);

              for (let i = 0; i < psmrclblT.length; i++) {
                common.writeMntLog(
                  "psmrclbl",
                  null,
                  null,
                  created.psmrcuid + "-" + psmrclblT[i],
                  "A",
                  req.user.psusrunm,
                  "", created.psmrcuid + "-" + psmrclblT[i]);
              }
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

  //Validation
  const { errors, isValid } = validatePsmrcparInput(req.body, "C");
  if (!isValid) return returnError(req, 400, errors, res);
  if (!_.isEmpty(req.body.psmrcown)) {
    //Check Username
    let flag = await psusrprf.findOne({
      where: {
        psusrunm: req.body.psmrcown
      }, raw: true, attributes: ['psusrunm', 'psusrnam']
    });

    if (!flag) {
      return returnError(req, 400, { psusrunm: "NORECORDFOUND" }, res)
    }

  }
  // if (req.body.psmrcssm && !isValidNumericString(req.body.psmrcssm)) {
  //     return returnError(req, 400, { psmrcssm: "SSM No. only allow number" }, res)
  //   }

  if (req.body.psmrcacc && !isValidNumericString(req.body.psmrcacc)) {
    return returnError(req, 400, { psmrcacc: "Bank Account No. only allow number" }, res)
  }

  await psmrcpar
    .findOne({
      where: {
        psmrcuid: id,
      },
      raw: true,
      attributes: {
        exclude: ["createdAt", "crtuser", "mntuser"],
      },
    })
    .then(async (data) => {
      if (data) {

        let ssmChange, sfiChange, ppiChange = false;

        if (data.psmrcssc != req.body.psmrcssc) {
          // Image Validation
          let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psmrcssc);
          if (!img_exist) return returnError(req, 400, { psmrcssc: "INVALIDDATAVALUE" }, res);
          ssmChange = true;
        }
        if (data.psmrcsfi != req.body.psmrcsfi) {
          // Image Validation
          let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psmrcsfi);
          if (!img_exist) return returnError(req, 400, { psmrcsfi: "INVALIDDATAVALUE" }, res);
          sfiChange = true;
        }
        if (data.psmrcppi != req.body.psmrcppi) {
          // Image Validation
          let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psmrcppi);
          if (!img_exist) return returnError(req, 400, { psmrcppi: "INVALIDDATAVALUE" }, res);
          ppiChange = true;
        }

        let ddlErrors = {};
        let err_ind = false;


        let psmrclblT = req.body.psmrclbl;
        for (let i = 0; i < psmrclblT.length; i++) {

          let aff1 = await common.retrieveSpecificGenCodes(
            req,
            "MRCTYP",
            psmrclblT[i]
          );
          if (!aff1 || !aff1.prgedesc) {
            ddlErrors.psmrclblT[i] = "INVALIDDATAVALUE";
            err_ind = true;
          }


        }

        const existingTypes = await psmrclbl.findAll({
          where: { psmrcuid: req.body.psmrcuid },
          attributes: ['psmrctyp'],
          raw: true
        });

        // Convert to arrays for easier comparison
        const existing = existingTypes.map(exist => exist.psmrctyp);

        //Types to create
        const toCreate = psmrclblT.filter(t => !existing.includes(t));

        //Types to delete
        const toDelete = existing.filter(t => !psmrclblT.includes(t));




        let bankname = await common.retrieveSpecificGenCodes(
          req,
          "BANK",
          req.body.psmrcbnk
        );
        if (!bankname || !bankname.prgedesc) {
          ddlErrors.psmrcbnk = "INVALIDDATAVALUE";
          err_ind = true;
        }

        let yesorno = await common.retrieveSpecificGenCodes(
          req,
          "YESORNO",
          req.body.psmrcsts
        );
        if (!yesorno || !yesorno.prgedesc) {
          ddlErrors.psmrcsts = "INVALIDDATAVALUE";
          err_ind = true;
        }



        if (err_ind) return returnError(req, 400, ddlErrors, res);


        if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

        const t = await connection.sequelize.transaction();

        psmrcpar
          .update(
            {
              psmrcnme: req.body.psmrcnme,
              // psmrcuid: req.body.psmrcuid,
              psmrcdsc: req.body.psmrcdsc,
              psmrclds: req.body.psmrclds,
              psmrcsdt: new Date(),
              psmrcjdt: req.body.psmrcjdt,
              psmrcown: req.body.psmrcown,
              psmrcssm: req.body.psmrcssm,
              psmrcssc: req.body.psmrcssc,
              psmrcsts: req.body.psmrcsts,
              psmrcbnk: req.body.psmrcbnk,
              psmrcacc: req.body.psmrcacc,
              psmrcsfi: req.body.psmrcsfi,
              psmrcppi: req.body.psmrcppi,
              psmrcrtg: req.body.psmrcrtg,
              psmrcrmk: req.body.psmrcrmk,
              psmrcbnm: req.body.psmrcbnm,
              // psmrctyp: req.body.psmrctyp,


              mntuser: req.user.psusrunm,
            },
            {
              where: {
                psmrcuid: id,
              },
            }
          )
          .then(async () => {
            for (let i = 0; i < toCreate.length; i++) {
              psmrclbl
                .create({
                  psmrcuid: id,
                  psmrctyp: toCreate[i],

                }).catch(async (err) => {
                  await t.rollback();
                  console.log("Error when creating Merchant Label: ", err);
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }
            for (let i = 0; i < toDelete.length; i++) {
              psmrclbl
                .destroy({
                  where: {
                    psmrcuid: id,
                    psmrctyp: toDelete[i],
                  }
                }).catch(async (err) => {
                  await t.rollback();
                  console.log("Error when deleting Merchant Label: ", err);
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }

            if (ssmChange) {
              if (fs.existsSync(genConfig.ssmImagePath + data.psmrcssc)) {
                fs.unlinkSync(genConfig.ssmImagePath + data.psmrcssc);
              }

              await common
                .writeImage(
                  genConfig.documentTempPath,
                  genConfig.ssmImagePath,
                  req.body.psmrcssc,
                  // uuidv4(),
                  req.user.psusrunm,
                  4,
                  t
                )
                .catch(async (err) => {
                  console.log(err);
                  await t.rollback();
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }
            if (sfiChange) {
              if (fs.existsSync(genConfig.merchantImagePath + data.psmrcsfi) && data.psmrcsfi) {
                fs.unlinkSync(genConfig.merchantImagePath + data.psmrcsfi);
              }

              await common
                .writeImage(
                  genConfig.documentTempPath,
                  genConfig.merchantImagePath,
                  req.body.psmrcsfi,
                  // uuidv4(),
                  req.user.psusrunm,
                  3,
                  t
                )
                .catch(async (err) => {
                  console.log(err);
                  await t.rollback();
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }
            if (ppiChange) {
              if (fs.existsSync(genConfig.merchantImagePath + data.psmrcppi) && data.psmrcppi) {
                fs.unlinkSync(genConfig.merchantImagePath + data.psmrcppi);
              }

              await common
                .writeImage(
                  genConfig.documentTempPath,
                  genConfig.merchantImagePath,
                  req.body.psmrcppi,
                  // uuidv4(),
                  req.user.psusrunm,
                  3,
                  t
                )
                .catch(async (err) => {
                  console.log(err);
                  await t.rollback();
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }


            await t.commit();
            await common.writeMntLog(
              "psmrcpar",
              data,
              await psmrcpar.findOne({
                where: {
                  psmrcuid: data.psmrcuid
                }, raw: true
              }),
              data.psmrcuid,
              "C",
              req.user.psusrunm
            );
            for (let i = 0; i < toCreate.length; i++) {
              await common.writeMntLog(
                "psmrclbl",
                null,
                null,
                created.psmrcuid + "-" + toCreate[i],
                "A",
                req.user.psusrunm,
                "", created.psmrcuid + "-" + toCreate[i]);
            }
            for (let i = 0; i < toDelete.length; i++) {
              common.writeMntLog(
                "psmrclbl",
                null,
                null,
                created.psmrcuid + "-" + toDelete[i],
                "D",
                req.user.psusrunm,
                "",
                created.psmrcuid + "-" + toDelete[i],

              );
            }
            return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
          });
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log("This is the unx error", err)
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.delete = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
  const t = await connection.sequelize.transaction();

  await psmrcpar
    .findOne({
      where: {
        psmrcuid: id,
      },
      raw: true
    })
    .then((trnscd) => {
      if (trnscd) {
        psmrcpar
          .destroy({
            where: { psmrcuid: id },
          }, { transaction: t })
          .then(async () => {
            await psmrclbl.findAll({
              where: {
                psmrcuid: id
              }, raw: true, attributes: ["psmrctyp"]
            }).then(async (merchantTypes) => {
              const existing = merchantTypes.map(exist => exist.psmrctyp);
              await psmrclbl.destroy({
                where: {
                  psmrcuid: id
                }
              });


              try {
                // Remove Image
                if (fs.existsSync(genConfig.ssmImagePath + trnscd.psmrcssc)) {
                  fs.unlinkSync(genConfig.ssmImagePath + trnscd.psmrcssc);
                }
                if (fs.existsSync(genConfig.merchantImagePath + trnscd.psmrcsfi) && trnscd.psmrcsfi) {
                  fs.unlinkSync(genConfig.merchantImagePath + trnscd.psmrcsfi);
                }
                if (fs.existsSync(genConfig.merchantImagePath + trnscd.psmrcppi && trnscd.psmrcppi)) {
                  fs.unlinkSync(genConfig.merchantImagePath + trnscd.psmrcppi);
                }
              } catch (err) {
                console.log("Remove Image Error :", err);
                await t.rollback();
                return returnError(req, 500, "UNEXPECTEDERROR", res);
              }

              common.writeMntLog(
                "psmrcpar",
                null,
                null,
                trnscd.psmrcuid,
                "D",
                req.user.psusrunm,
                "",
                trnscd.psmrcuid
              );
              for (let i = 0; i < existing.length; i++) {
                common.writeMntLog(
                  "psmrclbl",
                  null,
                  null,
                  trnscd.psmrcuid + "-" + existing[i],
                  "D",
                  req.user.psusrunm,
                  "",
                  trnscd.psmrcuid + "-" + existing[i],

                );
              }
              return returnSuccessMessage(req, 200, "RECORDDELETED", res);
            }).catch(async (err) => {
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

function isValidNumericString(input) {
  const maxLength = 25;
  const numericRegex = /^[0-9]*$/;

  return input.length <= maxLength && numericRegex.test(input);
}
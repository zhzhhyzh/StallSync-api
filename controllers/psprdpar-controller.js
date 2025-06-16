// Import
const db = require("../models");
const _ = require("lodash");
const fs = require("fs");


// Table File
const psprdpar = db.psprdpar;
const psprddtl = db.psprddtl;
const psmrcpar = db.psmrcpar;

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
const validatePsprdparInput = require("../validation/psprdpar-validation");
const validatePsprddtlInput = require("../validation/psprddtl-validation");

exports.list = async (req, res) => {
  let option = {
    [Op.and]: []
  };

  if (req.user.psusrtyp == "MCH") {
    option[Op.and].push({
      psmrcuid: req.user.psmrcuid
    })
  }
  let limit = 10;
  if (req.query.limit) limit = req.query.limit;

  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * parseInt(limit);



  if (req.query.psprdsts && !_.isEmpty(req.query.psprdsts)) {
    option[Op.and].push({ psprdsts: req.query.psprdsts });
  }


  if (req.query.psprdtyp && !_.isEmpty(req.query.psprdtyp)) {
    option[Op.and].push({ psprdtyp: req.query.psprdtyp });
  }

  // if (req.query.psprdfvg && !_.isEmpty(req.query.psprdfvg)) {
  //   option[Op.and].push({ psprdfvg: req.query.psprdfvg });
  // }

  // if (req.query.psprdhal && !_.isEmpty(req.query.psprdhal)) {
  //   option[Op.and].push({ psprdhal: req.query.psprdhal });
  // }

  if (req.query.psmrcuid && !_.isEmpty(req.query.psmrcuid) && req.user.psusrtyp != "MCH") {
    option[Op.and].push({ psmrcuid: req.query.psmrcuid });
  }



  if (req.query.search && !_.isEmpty(req.query.search)) {
    option[Op.and].push({
      [Op.or]: [
        { psprduid: { [Op.eq]: req.query.search } },
        { psprduid: { [Op.like]: `%${req.query.search}%` } },
        { psprdnme: { [Op.eq]: req.query.search } },
        { psprdnme: { [Op.like]: `%${req.query.search}%` } }
      ]
    });
  }



  const { count, rows } = await psprdpar.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psprduid", "id"],
      "psprduid",
      "psprdnme",
      "psprdcrd",
      "psprddsc",
      "psmrcuid",
      "psprdtyp",
      "psprdcat",
      "psprdsts",
      "psprdpri"
    ],
    order: [["psprduid", "asc"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];


    if (!_.isEmpty(obj.psprdsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "YESORNO",
        obj.psprdsts
      );
      obj.psprdstsdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(obj.psprdcat)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "PRODCAT",
        obj.psprdcat
      );
      obj.psprdcatdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(obj.psprdtyp)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "PRODTYP",
        obj.psprdtyp
      );
      obj.psprdtypdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }


    if (!_.isEmpty(obj.psprdpri)) {
      obj.psprdpri = common.formatDecimal(obj.psprdpri);
    }

    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psprdpar", key: ["psprduid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.findOne = async (req, res) => {
  const id = req.query.id ? req.query.id : "";
  if (id === "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  try {
    const obj = await psprdpar.findOne({ where: { psprduid: id }, raw: true });

    if (!obj) return returnError(req, 500, "NORECORDFOUND", res);

    const productTypes = await psprddtl.findAll({
      where: { psprduid: id },
      raw: true,
      attributes: ['psprduid', 'psprdaty', 'psprdapn', 'psprdmnd', 'psprdpri']
    });

    for (let i = 0; i < productTypes.length; i++) {
      if (!_.isEmpty(productTypes[i].psprdaty)) {
        const description = await common.retrieveSpecificGenCodes(
          req,
          "ADDON",
          productTypes[i].psprdaty
        );
        productTypes[i].psprdatydsc = description?.prgedesc || "";
      }

      if (!_.isEmpty(productTypes[i].psprdmnd)) {
        const description = await common.retrieveSpecificGenCodes(
          req,
          "YESORNO",
          productTypes[i].psprdmnd
        );
        productTypes[i].psprdmnddsc = description?.prgedesc || "";
      }
    }

    obj.psprddtl = productTypes;

    if (!_.isEmpty(obj.psprdtyp)) {
      const description = await common.retrieveSpecificGenCodes(req, "PRODTYP", obj.psprdtyp);
      obj.psprdtypdsc = description?.prgedesc || "";
    }


    if (!_.isEmpty(obj.psprdcat)) {
      const description = await common.retrieveSpecificGenCodes(req, "PRODCAT", obj.psprdcat);
      obj.psprdcatdsc = description?.prgedesc || "";
    }

    if (!_.isEmpty(obj.psprdsts)) {
      const description = await common.retrieveSpecificGenCodes(req, "PRODSTS", obj.psprdsts);
      obj.psprdstsdsc = description?.prgedesc || "";
    }


    if (!_.isEmpty(obj.psprdfvg)) {
      const description = await common.retrieveSpecificGenCodes(req, "YESORNO", obj.psprdfvg);
      obj.psprdfvgdsc = description?.prgedesc || "";
    }


    if (!_.isEmpty(obj.psprdhal)) {
      const description = await common.retrieveSpecificGenCodes(req, "YESORNO", obj.psprdhal);
      obj.psprdhaldsc = description?.prgedesc || "";
    }

    if (!_.isEmpty(obj.psprdcid)) {
      const description = await common.retrieveSpecificGenCodes(req, "YESORNO", obj.psprdcid);
      obj.psprdciddsc = description?.prgedesc || "";
    }



    return returnSuccess(200, obj, res);
  } catch (err) {
    console.error(err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};


exports.create = async (req, res) => {
  let merchantid = req.body.psmrcuid
  if (req.user.psusrtyp == "MCH") {
    option[Op.and].push({
      merchantid: req.user.psmrcuid
    })
  }

  //Validation
  const { errors, isValid } = validatePsprdparInput(req.body, "A");
  if (!isValid) return returnError(req, 400, errors, res);

  let profilePic = false;

  if (!_.isEmpty(req.body.psprdimg)) {
    let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psprdimg);
    if (!img_exist) return returnError(req, 400, { psprdimg: "INVALIDDATAVALUE" }, res);
    profilePic = !profilePic;
  }

  //Check Username
  let flag = await psmrcpar.findOne({
    where: {
      psmrcuid: req.body.psmrcuid
    }, raw: true, attributes: ['psmrcuid', 'psmrcnme']
  });

  if (!flag) {
    return returnError(req, 400, { psmrcuid: "NORECORDFOUND" }, res)
  }


  // Duplicate Check
  psprdpar
    .findOne({
      where: {
        psprduid: req.body.psprduid,
      },
      raw: true,
    })
    .then(async (trnscd) => {
      if (trnscd)
        return returnError(req, 400, { psprdpar: "RECORDEXISTS" }, res);
      else {
        let ddlErrors = {};
        let err_ind = false;

        let psprddtlT = req.body.psprddtl;
        for (let i = 0; i < psprddtlT.length; i++) {
          const { errors, isValid } = validatePsprddtlInput(req.body, "A");
          if (!isValid) return returnError(req, 400, errors, res);

          let aff1 = await common.retrieveSpecificGenCodes(
            req,
            "ADDON",
            psprddtlT[i].psprdaty
          );
          if (!aff1 || !aff1.prgedesc) {
            ddlErrors.psprddtlT[i].psprdaty = "INVALIDDATAVALUE";
            err_ind = true;
          }

          let aff2 = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            psprddtlT[i].psprdmnd
          );
          if (!aff2 || !aff2.prgedesc) {
            ddlErrors.psprddtlT[i].psprdmnd = "INVALIDDATAVALUE";
            err_ind = true;
          }


        }


        let prodtype = await common.retrieveSpecificGenCodes(
          req,
          "PRODTYP",
          req.body.psprdtyp
        );
        if (!prodtype || !prodtype.prgedesc) {
          ddlErrors.psprdtyp = "INVALIDDATAVALUE";
          err_ind = true;
        }

        if (!_.isEmpty(req.body.psprdsts)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "PRODSTS",
            req.body.psprdsts
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psprdsts = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }

        if (!_.isEmpty(req.body.psprdcat)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "PRODCAT",
            req.body.psprdcat
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psprdcat = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }

        if (!_.isEmpty(req.body.psprdfvg)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psprdfvg
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psprdfvg = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }

        if (!_.isEmpty(req.body.psprdhal)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psprdhal
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psprdhal = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }

        if (!_.isEmpty(req.body.psprdcid)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psprdcid
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psprdcid = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }



        if (err_ind) return returnError(req, 400, ddlErrors, res);
        else {
          const t = await connection.sequelize.transaction();

          // Generate Code
          let code = await common.getNextRunning(merchantid);
          let initial = merchantid
          let reference = initial;
          reference += _.padStart(code, 6, '0');


          psprdpar
            .create({
              psprdnme: req.body.psprdnme,
              psprduid: reference,
              psprddsc: req.body.psprddsc,
              psprdlds: req.body.psprdlds,
              psprdimg: req.body.psprdimg,
              psmrcuid: merchantid,
              psprdtyp: req.body.psprdtyp,
              psprdcat: req.body.psprdcat,
              psprdfvg: req.body.psprdfvg ? req.body.psprdfvg : "N",
              psprdhal: req.body.psprdhal ? req.body.psprdhal : "N",
              psprdcid: req.body.psprdcid ? req.body.psprdcid : "N",
              psprdlsr: req.body.psprdlsr,
              psprdstk: req.body.psprdstk,
              psprdpri: req.body.psprdpri,
              psprdddt: req.body.psprdddt,
              psprddva: req.body.psprddva,
              psprdrmk: req.body.psprdrmk,
              psprdsdt: new Date(),
              psprdcrd: req.body.psprdcrd ? req.body.psprdcrd : new Date(),
              psprdlsr: req.body.psprdlsr,
              psprdstk: req.body.psprdstk,
              psprdsts: req.body.psprdsts ? req.body.psprdsts : "A",

              psprdrtg: 0,

              crtuser: req.user.psusrnme,
              mntuser: req.user.psusrnme,
            })
            .then(async (data) => {
              let created = data.get({ plain: true });
              for (let i = 0; i < psprddtlT.length; i++) {
                psprddtl
                  .create({
                    psprduid: reference,
                    psprdaty: psprddtlT[i].psprdaty,
                    psprdapn: psprddtlT[i].psprdapn,
                    psprdmnd: psprddtlT[i].psprdmnd ? psprddtlT[i].psprdmnd : "N",
                    psprdpri: psprddtlT[i].psprdpri,


                  }).catch(async (err) => {
                    await t.rollback();
                    console.log("Error when creating Product Type: ", err);
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                  });
              }

              if (profilePic) {
                await common
                  .writeImage(
                    genConfig.documentTempPath,
                    genConfig.productImagePath,
                    created.psprdimg,
                    // uuidv4(),
                    req.user.psusrnme,
                    5,
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
                "psprdpar",
                null,
                null,
                created.psprduid,
                "A",
                req.user.psusrnme,
                "", created.psprduid);

              for (let i = 0; i < psprddtlT.length; i++) {
                common.writeMntLog(
                  "psprddtl",
                  null,
                  null,
                  created.psprduid + "-" + psprddtlT[i].psprdapn,
                  "A",
                  req.user.psusrnme,
                  "", created.psprduid + "-" + psprddtlT[i].psprdapn);
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
  const { errors, isValid } = validatePsprdparInput(req.body, "C");
  if (!isValid) return returnError(req, 400, errors, res);

  await psprdpar
    .findOne({
      where: {
        psprduid: id,
      },
      raw: true,
      attributes: {
        exclude: ["createdAt", "crtuser", "mntuser"],
      },
    })
    .then(async (data) => {
      if (data) {

        let ppiChange = false;

        if (data.psprdimg != req.body.psprdimg) {
          // Image Validation
          let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psprdimg);
          if (!img_exist) return returnError(req, 400, { psprdimg: "INVALIDDATAVALUE" }, res);
          ppiChange = true;
        }

        let ddlErrors = {};
        let err_ind = false;


        let psprddtlT = req.body.psprddtl;
        for (let i = 0; i < psprddtlT.length; i++) {

          const { errors, isValid } = validatePsprddtlInput(req.body, "A");
          if (!isValid) return returnError(req, 400, errors, res);

          let aff1 = await common.retrieveSpecificGenCodes(
            req,
            "ADDON",
            psprddtlT[i].psprdaty
          );
          if (!aff1 || !aff1.prgedesc) {
            ddlErrors.psprddtlT[i].psprdaty = "INVALIDDATAVALUE";
            err_ind = true;
          }

          let aff2 = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            psprddtlT[i].psprdmnd
          );
          if (!aff2 || !aff2.prgedesc) {
            ddlErrors.psprddtlT[i].psprdmnd = "INVALIDDATAVALUE";
            err_ind = true;
          }


        }

        const existingTypes = await psprddtl.findAll({
          where: { psprduid: req.body.psprduid },
          attributes: ['psprduid', 'psprdaty', 'psprdapn', 'psprdmnd', 'psprdpri'],
          raw: true
        });

        const newTypes = req.body.psprddtlT || []; // Ensure it's an array

        // Types to create
        const toCreate = newTypes.filter(newItem =>
          !existingTypes.some(existingItem => _.isEqual(newItem, existingItem))
        );

        // Types to delete
        const toDelete = existingTypes.filter(existingItem =>
          !newTypes.some(newItem => _.isEqual(newItem, existingItem))
        );



        let prodtype = await common.retrieveSpecificGenCodes(
          req,
          "PRODTYP",
          req.body.psprdtyp
        );
        if (!prodtype || !prodtype.prgedesc) {
          ddlErrors.psprdtyp = "INVALIDDATAVALUE";
          err_ind = true;
        }

        if (!_.isEmpty(req.body.psprdsts)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "PRODSTS",
            req.body.psprdsts
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psprdsts = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }

        if (!_.isEmpty(req.body.psprdcat)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "PRODCAT",
            req.body.psprdcat
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psprdcat = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }

        if (!_.isEmpty(req.body.psprdfvg)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psprdfvg
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psprdfvg = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }

        if (!_.isEmpty(req.body.psprdhal)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psprdhal
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psprdhal = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }

        if (!_.isEmpty(req.body.psprdcid)) {
          let yesorno = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            req.body.psprdcid
          );
          if (!yesorno || !yesorno.prgedesc) {
            ddlErrors.psprdcid = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }



        if (err_ind) return returnError(req, 400, ddlErrors, res);


        if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

        const t = await connection.sequelize.transaction();

        psprdpar
          .update(
            {
              psprdnme: req.body.psprdnme,
              // psprduid: req.body.psprduid,
              psprddsc: req.body.psprddsc,
              psprdlds: req.body.psprdlds,
              psprdimg: req.body.psprdimg,
              // psmrcuid: req.body.psmrcuid,
              psprdtyp: req.body.psprdtyp,
              psprdcat: req.body.psprdcat,
              psprdfvg: req.body.psprdfvg,
              psprdhal: req.body.psprdhal,
              psprdcid: req.body.psprdcid,
              psprdlsr: req.body.psprdlsr,
              psprdstk: req.body.psprdstk,
              psprdpri: req.body.psprdpri,
              psprdddt: req.body.psprdddt,
              psprddva: req.body.psprddva,
              psprdrmk: req.body.psprdrmk,
              psprdsdt: req.body.psprdsdt,
              psprdcrd: req.body.psprdcrd,
              psprdlsr: req.body.psprdlsr,
              psprdstk: req.body.psprdstk,
              psprdsts: req.body.psprdsts,
              psprdrtg: req.body.psprdrtg,
              mntuser: req.user.psusrnme,
            },
            {
              where: {
                psprduid: id,
              },
            }
          )
          .then(async () => {
            for (let i = 0; i < toCreate.length; i++) {
              psprddtl
                .create(toCreate[i]).catch(async (err) => {
                  await t.rollback();
                  console.log("Error when creating Product Type: ", err);
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }
            for (let i = 0; i < toDelete.length; i++) {
              psprddtl
                .destroy({
                  where: {
                    psprduid: id,
                    psprdaty: toDelete[i].psprdaty,
                  }
                }).catch(async (err) => {
                  await t.rollback();
                  console.log("Error when deleting Product Type: ", err);
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }




            if (ppiChange) {
              if (fs.existsSync(genConfig.productImagePath + item.psprdimg)) {
                fs.unlinkSync(genConfig.productImagePath + item.psprdimg);
              }

              await common
                .writeImage(
                  genConfig.documentTempPath,
                  genConfig.productImagePath,
                  req.body.psprdimg,
                  // uuidv4(),
                  req.user.psusrnme,
                  5,
                  t
                )
                .catch(async (err) => {
                  console.log(err);
                  await t.rollback();
                  return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }


            await t.commit();
            common.writeMntLog(
              "psprdpar",
              data,
              await psprdpar.findByPk(data.id, { raw: true }),
              data.psprduid,
              "C",
              req.user.psusrnme
            );
            for (let i = 0; i < toCreate.length; i++) {
              common.writeMntLog(
                "psprddtl",
                null,
                null,
                created.psprduid + "-" + toCreate[i].psprdapn,
                "A",
                req.user.psusrnme,
                "", created.psprduid + "-" + toCreate[i].psprdapn);
            }
            for (let i = 0; i < toDelete.length; i++) {
              common.writeMntLog(
                "psprddtl",
                null,
                null,
                created.psprduid + "-" + toDelete[i].psprdapn,
                "D",
                req.user.psusrnme,
                "",
                created.psprduid + "-" + toDelete[i].psprdapn,

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

  await psprdpar
    .findOne({
      where: {
        psprduid: id,
      },
      raw: true
    })
    .then((trnscd) => {
      if (trnscd) {
        psprdpar
          .destroy({
            where: { psprduid: id },
          })
          .then(async () => {
            await psprddtl.findAll({
              where: {
                psprduid: id
              }, raw: true, attributes: ["psprdaty"]
            }).then(async (productTypes) => {
              const existing = productTypes.map(exist => exist.psprdaty);
              await psprddtl.destroy({
                where: {
                  psprduid: id
                }
              });


              try {

                if (fs.existsSync(genConfig.productImagePath + item.psprdimg)) {
                  fs.unlinkSync(genConfig.productImagePath + item.psprdimg);
                }
              } catch (err) {
                console.log("Remove Image Error :", err);
                await t.rollback();
                return returnError(req, 500, "UNEXPECTEDERROR", res);
              }

              common.writeMntLog(
                "psprdpar",
                null,
                null,
                trnscd.psprduid,
                "D",
                req.user.psusrnme,
                "",
                trnscd.psprduid
              );
              for (let i = 0; i < existing.length; i++) {
                common.writeMntLog(
                  "psprddtl",
                  null,
                  null,
                  created.psprduid + "-" + existing[i],
                  "D",
                  req.user.psusrnme,
                  "",
                  created.psprduid + "-" + existing[i],

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

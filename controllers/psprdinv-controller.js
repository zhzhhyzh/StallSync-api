// Import
const db = require("../models");
const _ = require("lodash");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");


// Table File
const psprdinv = db.psprdinv;
const psprdpar = db.psprdpar;


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
const validatePsprdinvInput = require("../validation/psprdinv-validation.js");
const { psinvsdt } = require("../constant/fieldNames.js");

exports.list = async (req, res) => {
  if (!req.query.prodId) return returnError(req, 400, { prodId: "RECORDIDISREQUIRED" }, res);


  let limit = 10;
  if (req.query.limit) limit = req.query.limit;

  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * parseInt(limit);




  let option = {

  };




  if (req.query.psinvsty && !_.isEmpty(req.query.psinvsty)) {
    option.psinvsty = req.query.psinvsty;
  }

  let prodId = req.query.prodId

  if (prodId) {
    option.psprduid = req.query.prodId;
  }


  if (req.query.from && !_.isEmpty("" + req.query.from)) {
    let fromDate = new Date(req.query.from);
    fromDate.setHours(0, 0, 0, 0);
    if (!_.isNaN(fromDate.getTime())) {
      if (req.query.to && !_.isEmpty("" + req.query.to)) {
        let toDate = new Date(req.query.to);
        toDate.setHours(23, 59, 59, 999);
        if (!_.isNaN(toDate.getTime())) {
          option.psinvsdt = {
            [Op.and]: [{ [Op.gte]: fromDate }, { [Op.lte]: toDate }],
          };
        } else {
          option.psinvsdt = {
            [Op.gte]: fromDate,
          };
        }
      } else {
        option.psinvsdt = {
          [Op.gte]: fromDate,
        };
      }
    }
  } else if (req.query.to && !_.isEmpty("" + req.query.to)) {
    let toDate = new Date(req.query.to);
    toDate.setHours(23, 59, 59, 999);
    if (!_.isNaN(toDate.getTime())) {
      option.psinvsdt = {
        [Op.lte]: toDate,
      };
    }
  }



  const { count, rows } = await psprdinv.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psstkuid", "id"],
      "psstkuid",
      "psprduid",
      "psinvsty",
      "psinvsdt",
      "psinvqty",
      "psinvven",
      "psinvpri"
    ],
    order: [["psprduid", "asc"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];


    if (!_.isEmpty(obj.psinvsty)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "STKTYP",
        obj.psinvsty
      );
      obj.psinvstydsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    obj.psinvsdt = await common.formatDateTime(obj.psinvsdt)
    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psprdinv", key: ["pstkuid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.findOne = async (req, res) => {
  const id = req.query.id ? req.query.id : "";
  if (id === "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  try {
    const obj = await psprdinv.findOne({ where: { psstkuid: id }, raw: true });

    if (!obj) return returnError(req, 500, "NORECORDFOUND", res);

    if (!_.isEmpty(obj.psinvsty)) {
      const description = await common.retrieveSpecificGenCodes(req, "STKTYP", obj.psinvsty);
      obj.psinvstydsc = description?.prgedesc || "";
    }



    return returnSuccess(200, obj, res);
  } catch (err) {
    console.error(err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};


exports.create = async (req, res) => {
  //Validation
  const { errors, isValid } = validatePsprdinvInput(req.body, "A");
  if (!isValid) return returnError(req, 400, errors, res);
  const psinvsdt = req.body.psinvsdt ? req.body.psinvsdt : new Date();
  // Duplicate Check
  psprdinv
    .findOne({
      where: {
        psprduid: req.body.psprduid,
        psinvsdt: psinvsdt,
        psinvsty: req.body.psinvsty
      },
      raw: true,
    })
    .then(async (trnscd) => {
      if (trnscd)
        return returnError(req, 400, { psprdinv: "RECORDEXISTS" }, res);
      else {
        let ddlErrors = {};
        let err_ind = false;

        if (!_.isEmpty(req.body.psinvsty)) {
          let STKTYP = await common.retrieveSpecificGenCodes(
            req,
            "STKTYP",
            req.body.psinvsty
          );
          if (!STKTYP || !STKTYP.prgedesc) {
            ddlErrors.psinvsty = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }



        if (err_ind) return returnError(req, 400, ddlErrors, res);
        else {
          const t = await connection.sequelize.transaction();
          let result = await psprdpar.findOne({
            where: {
              psprduid: req.body.psprduid
            }, raw: true, attributes: ['psprduid', 'psprdstk', 'psprdsts', 'psprdlsr']
          });

          let newQty = 0;
          let newSts = "";
          if (!result) {
            return returnError(req, 500, { psprduid: "NORECORDFOUND" }, res)
          }
          newQty = result.psprdstk + req.body.psinvqty
          if (newQty > result.psprdlsr) {
            newSts = "A"
          }
          if (newQty <= result.psprdlsr) {
            newSts = "L"
          }

          if (newQty == 0) {
            newSts = "S"
          }



          await psprdinv
            .create({
              psstkuid: uuidv4(),
              psinvsty: req.body.psinvsty,
              psprduid: req.body.psprduid,
              psinvqty: req.body.psinvqty,
              psinvsdt: req.body.psinvsdt ? req.body.psinvsdt : new Date(),
              psinvpri: req.body.psinvsty == "I" ? req.body.psinvpri : 0,
              psinvven: req.body.psinvsty == "I" ? req.body.psinvven : "",
              crtuser: req.user.psusrunm,
              mntuser: req.user.psusrunm,
            }, { transaction: t })
            .then(async (data) => {
              let created = data.get({ plain: true });

              const [updatedCount] = await psprdpar.update(
                {
                  psprdstk: newQty,
                  psprdsts: newSts,
                },
                {
                  where: {
                    psprduid: req.body.psprduid,
                  },
                }
              );
              await t.commit();
              console.log("Update affected rows:", updatedCount);
              common.writeMntLog(
                "psprdinv",
                null,
                null,
                created.psstkuid,
                "A",
                req.user.psusrunm,
                "", created.psstkuid);

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
  const { errors, isValid } = validatePsprdinvInput(req.body, "C");
  if (!isValid) return returnError(req, 400, errors, res);

  await psprdinv
    .findOne({
      where: {
        psstkuid: id,
      },
      raw: true,
      attributes: {
        exclude: ["createdAt", "crtuser", "mntuser"],
      },
    })
    .then(async (data) => {
      if (data) {

        let ddlErrors = {};
        let err_ind = false;

        if (!_.isEmpty(req.body.psinvsty)) {
          let STKTYP = await common.retrieveSpecificGenCodes(
            req,
            "STKTYP",
            req.body.psinvsty
          );
          if (!STKTYP || !STKTYP.prgedesc) {
            ddlErrors.psinvsty = "INVALIDDATAVALUE";
            err_ind = true;
          }
        }

        if (err_ind) return returnError(req, 400, ddlErrors, res);



        if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)


        let result = await psprdpar.findOne({
          where: {
            psprduid: req.body.psprduid
          }, raw: true, attributes: ['psprduid', 'psprdstk', 'psprdsts', 'psprdlsr']
        });

        let newQty = 0;
        let newSts = "";
        if (!result) {
          return returnError(req, 500, { psprduid: "NORECORDFOUND" }, res)
        } else {
          newQty = result.psprdstk + req.body.psinvqty - data.psinvqty;
          if (newQty > result.psprdlsr) {
            newSts = "A"
          }
          if (newQty <= result.psprdlsr) {
            newSts = "L"
          }

          if (newQty == 0) {
            newSts = "S"
          }


        }

        const t = await connection.sequelize.transaction();

        psprdinv
          .update(
            {
              // psstkuid: psstkuid,
              psinvsty: req.body.psinvsty,
              psprduid: req.body.psprduid,
              psinvqty: req.body.psinvqty,
              psinvsty: req.body.psinvsty,
              psinvsdt: req.body.psinvsdt ? req.body.psinvsdt : new Date(),
              psinvpri: req.body.psinvpri,
              psinvven: req.body.psinvven,
              mntuser: req.user.psusrunm,
            },
            {
              where: {
                psstkuid: id,
              },
            }, { transaction: t }
          )
          .then(async () => {
            await psprdpar.update({
              psprdstk: newQty,
              psprdsts: newSts
            }, {
              where: {
                psprduid: req.body.psprduid
              }
            })
            t.commit();
            common.writeMntLog(
              "psprdinv",
              data,
              await psprdinv.findByPk(data.id, { raw: true }),
              data.psstkuid,
              "C",
              req.user.psusrunm
            )
            return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
          }).catch(async err => {
            console.log(err);
            await t.rollback();
            return returnError(req, 500, "UNEXPECTEDERROR", res)
          });
        ;
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log("This is the unx error", err)
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

// exports.delete = async (req, res) => {
//   const id = req.body.id ? req.body.id : "";
//   if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
//   // const t = await connection.sequelize.transaction();

//   await psprdinv
//     .findOne({
//       where: {
//         psprduid: id,
//       },
//       raw: true
//     })
//     .then((trnscd) => {
//       if (trnscd) {
//         psprdinv
//           .destroy({
//             where: { psprduid: id },
//           })
//           .then(async () => {
//             return returnSuccessMessage(req, 200, "RECORDDELETED", res);
//           })
//           .catch(async (err) => {
//             console.log(err);
//             return returnError(req, 500, "UNEXPECTEDERROR", res);
//           });
//       } else return returnError(req, 500, "NORECORDFOUND", res);
//     })
//     .catch((err) => {
//       console.log(err);
//       return returnError(req, 500, "UNEXPECTEDERROR", res);
//     });
// };

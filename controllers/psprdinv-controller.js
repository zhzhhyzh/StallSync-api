// Import
const db = require("../models");
const _ = require("lodash");
const fs = require("fs");


// Table File
const psprdinv = db.psprdinv;


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
const validatePsprdInput = require("../validation/psprdinv-validation");

exports.list = async (req, res) => {
  if (!req.query.prodId) return returnError(req, 500, { prodId: "RECORDIDISREQUIRED" }, res);


  let limit = 10;
  if (req.query.limit) limit = req.query.limit;

  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * parseInt(limit);




  let option = {
    [Op.and]: []
  };




  if (req.query.psinvsty && !_.isEmpty(req.query.psinvsty)) {
    option[Op.and].push({ psinvsty: req.query.psinvsty });
  }
  if (req.query.prodId && !_.isEmpty(req.query.prodId)) {
    option[Op.and].push({ psprduid: req.query.prodId });
  }

  const fromDateStr = '' + req.query.from;
  const toDateStr = '' + req.query.to;

  if (!_.isEmpty(fromDateStr) || !_.isEmpty(toDateStr)) {
    let dateCondition = {};

    if (!_.isEmpty(fromDateStr)) {
      let fromDate = new Date(fromDateStr);
      if (!isNaN(fromDate.getTime())) {
        fromDate.setHours(0, 0, 0, 0);
        dateCondition[Op.gte] = fromDate;
      }
    }

    if (!_.isEmpty(toDateStr)) {
      let toDate = new Date(toDateStr);
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        dateCondition[Op.lte] = toDate;
      }
    }

    if (!_.isEmpty(dateCondition)) {
      option[Op.and].push({ psinvsdt: dateCondition });
    }
  }

  // if (req.query.from && !_.isEmpty('' + req.query.from)) {
  //   let fromDate = new Date(req.query.from);
  //   fromDate.setHours(0, 0, 0, 0);
  //   if (!_.isNaN(fromDate.getTime())) {
  //     if (req.query.to && !_.isEmpty('' + req.query.to)) {
  //       let toDate = new Date(req.query.to);
  //       toDate.setHours(23, 59, 59, 999);
  //       if (!_.isNaN(toDate.getTime())) {
  //         option.psinvsdt = {
  //           [Op.and]: [
  //             { [Op.gte]: fromDate },
  //             { [Op.lte]: toDate }
  //           ]
  //         }
  //       } else {
  //         option.psinvsdt = {
  //           [Op.gte]: fromDate
  //         }
  //       }
  //     } else {
  //       option.psinvsdt = {
  //         [Op.gte]: fromDate
  //       }
  //     }
  //   }
  // } else if (req.query.to && !_.isEmpty('' + req.query.to)) {
  //   let toDate = new Date(req.query.to);
  //   toDate.setHours(23, 59, 59, 999);
  //   if (!_.isNaN(toDate.getTime())) {
  //     option.psinvsdt = {
  //       [Op.lte]: toDate
  //     }
  //   }
  // }

  const { count, rows } = await psprdinv.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psprduid", "id"],
      "psprduid",
      "psinvsty",
      "psinvsdt",
      "psinvqty",
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

    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psprdinv", key: ["psprduid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.findOne = async (req, res) => {
  const id = req.query.id ? req.query.id : "";
  if (id === "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  try {
    const obj = await psprdinv.findOne({ where: { psprduid: id }, raw: true });

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
  const { errors, isValid } = validatePsprdInput(req.body, "A");
  if (!isValid) return returnError(req, 400, errors, res);

  // Duplicate Check
  psprdinv
    .findOne({
      where: {
        psprduid: req.body.psprduid,
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
          // const t = await connection.sequelize.transaction();

          psprdinv
            .create({
              psinvsty: req.body.psinvsty,
              psprduid: req.body.psprduid,
              psinvqty: req.body.psinvqty,
              psinvsty: req.body.psinvsty,
              psinvsdt: req.body.psinvsdt ? req.body.psinvsdt : new Date(),
              crtuser: req.user.psusrnme,
              mntuser: req.user.psusrnme,
            })
            .then(async (data) => {
              // let created = data.get({ plain: true });

              // t.commit();
              // common.writeMntLog(
              //   "psprdinv",
              //   null,
              //   null,
              //   created.psprduid,
              //   "A",
              //   req.user.psusrnme,
              //   "", created.psprduid);

              return returnSuccessMessage(req, 200, "RECORDCREATED", res);

            })
            .catch((err) => {
              console.log(err);
              // t.rollback();
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

// exports.update = async (req, res) => {
//   const id = req.body.id ? req.body.id : "";
//   if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

//   //Validation
//   const { errors, isValid } = validatePsprdInput(req.body, "C");
//   if (!isValid) return returnError(req, 400, errors, res);

//   await psprdinv
//     .findOne({
//       where: {
//         psprduid: id,
//       },
//       raw: true,
//       attributes: {
//         exclude: ["createdAt", "crtuser", "mntuser"],
//       },
//     })
//     .then(async (data) => {
//       if (data) {
//         let ddlErrors = {};
//         let err_ind = false;

//         if (!_.isEmpty(req.body.psinvsty)) {
//           let STKTYP = await common.retrieveSpecificGenCodes(
//             req,
//             "STKTYP",
//             req.body.psinvsty
//           );
//           if (!STKTYP || !STKTYP.prgedesc) {
//             ddlErrors.psinvsty = "INVALIDDATAVALUE";
//             err_ind = true;
//           }
//         }

//         if (err_ind) return returnError(req, 400, ddlErrors, res);

//         if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

//         const t = await connection.sequelize.transaction();

//         psprdinv
//           .update(
//             {
//               psinvsty: req.body.psinvsty,
//               // psprduid: req.body.psprduid,
//               psinvqty: req.body.psinvqty,
//               psprdlds: req.body.psprdlds,
//               psprdimg: req.body.psprdimg,
//               // psmrcuid: req.body.psmrcuid,
//               psprdtyp: req.body.psprdtyp,
//               psprdcat: req.body.psprdcat,
//               psprdfvg: req.body.psprdfvg,
//               psprdhal: req.body.psprdhal,
//               psinvsty: req.body.psinvsty,
//               psprdlsr: req.body.psprdlsr,
//               psprdstk: req.body.psprdstk,
//               psprdpri: req.body.psprdpri,
//               psprdddt: req.body.psprdddt,
//               psprddva: req.body.psprddva,
//               psprdrmk: req.body.psprdrmk,
//               psprdsdt: req.body.psprdsdt,
//               psinvsdt: req.body.psinvsdt,
//               psprdlsr: req.body.psprdlsr,
//               psprdstk: req.body.psprdstk,
//               psinvsty: req.body.psinvsty,
//               psprdrtg: req.body.psprdrtg,
//               mntuser: req.user.psusrnme,
//             },
//             {
//               where: {
//                 psprduid: id,
//               },
//             }
//           )
//           .then(async () => {
//             for (let i = 0; i < toCreate.length; i++) {
//               psprddtl
//                 .create(toCreate[i]).catch(async (err) => {
//                   await t.rollback();
//                   console.log("Error when creating Product Type: ", err);
//                   return returnError(req, 500, "UNEXPECTEDERROR", res);
//                 });
//             }
//             for (let i = 0; i < toDelete.length; i++) {
//               psprddtl
//                 .destroy({
//                   where: {
//                     psprduid: id,
//                     psprdaty: toDelete[i].psprdaty,
//                   }
//                 }).catch(async (err) => {
//                   await t.rollback();
//                   console.log("Error when deleting Product Type: ", err);
//                   return returnError(req, 500, "UNEXPECTEDERROR", res);
//                 });
//             }




//             if (ppiChange) {
//               if (fs.existsSync(genConfig.productImagePath + item.psprdimg)) {
//                 fs.unlinkSync(genConfig.productImagePath + item.psprdimg);
//               }

//               await common
//                 .writeImage(
//                   genConfig.documentTempPath,
//                   genConfig.productImagePath,
//                   req.body.psprdimg,
//                   // uuidv4(),
//                   req.user.psusrnme,
//                   5
//                 )
//                 .catch(async (err) => {
//                   console.log(err);
//                   await t.rollback();
//                   return returnError(req, 500, "UNEXPECTEDERROR", res);
//                 });
//             }


//             await t.commit();
//             common.writeMntLog(
//               "psprdinv",
//               data,
//               await psprdinv.findByPk(data.id, { raw: true }),
//               data.psprduid,
//               "C",
//               req.user.psusrnme
//             );
//             for (let i = 0; i < toCreate.length; i++) {
//               common.writeMntLog(
//                 "psprddtl",
//                 null,
//                 null,
//                 created.psprduid + "-" + toCreate[i].psprdapn,
//                 "A",
//                 req.user.psusrnme,
//                 "", created.psprduid + "-" + toCreate[i].psprdapn);
//             }
//             for (let i = 0; i < toDelete.length; i++) {
//               common.writeMntLog(
//                 "psprddtl",
//                 null,
//                 null,
//                 created.psprduid + "-" + toDelete[i].psprdapn,
//                 "D",
//                 req.user.psusrnme,
//                 "",
//                 created.psprduid + "-" + toDelete[i].psprdapn,

//               );
//             }
//             return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
//           });
//       } else return returnError(req, 500, "NORECORDFOUND", res);
//     })
//     .catch((err) => {
//       console.log("This is the unx error", err)
//       return returnError(req, 500, "UNEXPECTEDERROR", res);
//     });
// };

exports.delete = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
  // const t = await connection.sequelize.transaction();

  await psprdinv
    .findOne({
      where: {
        psprduid: id,
      },
      raw: true
    })
    .then((trnscd) => {
      if (trnscd) {
        psprdinv
          .destroy({
            where: { psprduid: id },
          })
          .then(async () => {
            return returnSuccessMessage(req, 200, "RECORDDELETED", res);
          })
          .catch(async (err) => {
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

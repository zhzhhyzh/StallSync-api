// Import
const db = require("../models");
const _ = require("lodash");

//Table
const pstrxpar = db.pstrxpar;
const psordpar = db.psordpar;

// Common Functions
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");

// Input Validation
const validatePstrxparInput = require("../validation/pstrxpar-validation");

exports.list = async (req, res) => {
  // default 10 records per page
  let limit = 10;
  if (req.query.limit) limit = parseInt(req.query.limit);

  // page offset
  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * limit;

  // filters (where clause)
  let option = {};

  if (req.query.search && !_.isEmpty(req.query.search)) {
    option[Op.or] = [
      { pstrxuid: { [Op.like]: `%${req.query.search}%` } },
      { psorduid: { [Op.like]: `%${req.query.search}%` } },
    ];
  }

  if (req.query.pstrxsts && !_.isEmpty(req.query.pstrxsts)) {
    option.pstrxsts = req.query.pstrxsts;
  }

  if (req.query.pstrxmtd && !_.isEmpty(req.query.pstrxmtd)) {
    option.pstrxmtd = req.query.pstrxmtd;
  }



  if (req.query.from && !_.isEmpty("" + req.query.from)) {
    let fromDate = new Date(req.query.from);
    fromDate.setHours(0, 0, 0, 0);
    if (!_.isNaN(fromDate.getTime())) {
      if (req.query.to && !_.isEmpty("" + req.query.to)) {
        let toDate = new Date(req.query.to);
        toDate.setHours(23, 59, 59, 999);
        if (!_.isNaN(toDate.getTime())) {
          option.pstrxdat = {
            [Op.and]: [{ [Op.gte]: fromDate }, { [Op.lte]: toDate }],
          };
        } else {
          option.pstrxdat = {
            [Op.gte]: fromDate,
          };
        }
      } else {
        option.pstrxdat = {
          [Op.gte]: fromDate,
        };
      }
    }
  } else if (req.query.to && !_.isEmpty("" + req.query.to)) {
    let toDate = new Date(req.query.to);
    toDate.setHours(23, 59, 59, 999);
    if (!_.isNaN(toDate.getTime())) {
      option.pstrxdat = {
        [Op.lte]: toDate,
      };
    }
  }

  // if (req.query.pstrxdat && !_.isEmpty(req.query.pstrxdat)) {
  //   options[Op.and].push({
  //     pstrxdat: common.getDateFromString(req.query.pstrxdat),
  //   });
  // }

  const { count, rows } = await pstrxpar.findAndCountAll({
    where: option,
    limit: limit,
    offset: from,
    raw: true,
    attributes: [
      ['pstrxuid', 'id'],
      "pstrxuid",
      "psorduid",
      "pstrxdat",
      "pstrxamt",
      "pstrxsts",
      // "pstrxcrc",
      "pstrxmtd",
      // "pstrxba1",
      // "pstrxba2",
      // "pstrxbpo",
      // "pstrxbci",
      // "pstrxbst",
      "pstrxstr",
    ],
    order: [["pstrxdat", "DESC"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];

    if (!_.isEmpty(obj.pstrxsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "TRXSTS",
        obj.pstrxsts
      );
      obj.pstrxstsdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(obj.pstrxmtd)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "PYMTD",
        obj.pstrxmtd
      );
      obj.pstrxmtddsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    // if (!_.isEmpty(obj.pstrxcrc)) {
    //   let description = await common.retrieveSpecificGenCodes(
    //     req,
    //     "CRCY",
    //     obj.pstrxcrc
    //   );
    //   obj.pstrxcrcdsc =
    //     description.prgedesc && !_.isEmpty(description.prgedesc)
    //       ? description.prgedesc
    //       : "";
    // }
    obj.pstrxcrcdsc = "RM"

    obj.pstrxdat = await common.formatDateTime(obj.pstrxdat, "/");
    obj.pstrxamt = await common.formatDecimal(obj.pstrxamt, 2);
    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "pstrxpar", key: ["pstrxuid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.findOne = async (req, res) => {
  const id = req.query.id ? req.query.id : "";
  if (!id || id == "") {
    return returnError(req, 400, "RECORDIDISREQUIRED", res);
  }
  try {
    const result = await pstrxpar.findOne({
      where: { pstrxuid: id },
      raw: true,
    });

    if (!result) {
      return returnError(req, 400, "RECORDNOTFOUND", res);
    }
    if (!_.isEmpty(result.pstrxsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "TRXSTS",
        result.pstrxsts
      );
      result.pstrxstsdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(result.pstrxmtd)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "PYMTHD",
        result.pstrxmtd
      );
      result.pstrxmtddsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    // if (!_.isEmpty(result.pstrxcrc)) {
    //   let description = await common.retrieveSpecificGenCodes(
    //     req,
    //     "CRCY",
    //     result.pstrxcrc
    //   );
    //   result.pstrxcrcdsc =
    //     description.prgedesc && !_.isEmpty(description.prgedesc)
    //       ? description.prgedesc
    //       : "";
    // }
    result.pstrxcrcdsc = "RM"
    return returnSuccess(200, result, res);
  } catch (err) {
    console.log("Error in findOne:", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};

//   const id = req.body.id ? req.body.id : "";
//   if (!id || id == "") {
//     return returnError(req, 400, "RECORDIDISREQUIRED", res);
//   }

//   try {
//     const exist = await pstrxpar.findOne({
//       where: { pstrxuid: id },
//       raw: true,
//     });

//     if (!exist) {
//       return returnError(req, 400, "NORECORDFOUND", res);
//     }

//     await pstrxpar.destroy({
//       where: { pstrxuid: id },
//     });

//     await common.writeMntLog(
//       "pstrxpar",
//       null,
//       null,
//       id,
//       "D",
//       req.user.psusrunm,
//       "",
//       id
//     );

//     return returnSuccessMessage(req, 200, "RECORDDELETED", res);
//   } catch (err) {
//     console.log("Error in delete:", err);
//     return returnError(req, 500, "UNEXPECTEDERROR", res);
//   }
// };
// Import
const db = require("../models");
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");

//Table
const psmbrprf = db.psmbrprf;
const psusrprf = db.psusrprf;
const psmbrcrt = db.psmbrcrt;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");
const connection = require("../common/db");

// Input Validation
const validatePsmbrprfInput = require("../validation/psmbrprf-validation");

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
      { psmbruid: { [Op.like]: `%${req.query.search}%` } },
      { psmbrnam: { [Op.like]: `%${req.query.search}%` } },
      { psmbreml: { [Op.like]: `%${req.query.search}%` } },
    ];
  }

  if (req.query.psmbrtyp && !_.isEmpty(req.query.psmbrtyp)) {
    option.psmbrtyp = req.query.psmbrtyp;
  }

  //Sort and filter for psmbrpre
  if (req.query.psmbrpre && !_.isEmpty(req.query.psmbrpre)) {
    option.psmbrpre = req.query.psmbrpre;
  }
  const { count, rows } = await psmbrprf.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psmbruid", "id"],
      "psmbruid",
      "psmbrnam",
      "psmbreml",
      "psmbrdob",
      "psmbrpts",
      "psmbracs",
      "psmbrtyp",
      "psmbrexp",
      "psmbrjdt",
      "psmbrcar",
      "psusrnme",
      "psmbrpre",
      "psmbrphn",
    ],
    order: [["psmbruid", "asc"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];

    if (!_.isEmpty(obj.psmbrtyp)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "MBRTYP",
        obj.psmbrtyp
      );
      obj.psmbrtypdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(obj.psmbrpre)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "HPPRE",
        obj.psmbrpre
      );
      obj.psmbrpredsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    obj.psmbrjdt = await common.formatDate(obj.psmbrjdt, "/");
    obj.psmbrdob = await common.formatDate(obj.psmbrdob, "/");
    obj.psmbracs = await common.formatDecimal(obj.psmbracs);

    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psmbrprf", key: ["psmbruid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.findOne = async (req, res) => {
  const id = req.query.id ? req.query.id : "";
  if (!id || id == "") {
    return returnError(500, "RECORDIDISREQUIRED", res);
  }
  try {
    const result = await psmbrprf.findOne({
      where: { psmbruid: id },
      raw: true,
    });

    if (!result) return returnError(req, 400, "NORECORDFOUND", res);
    if (!_.isEmpty(result.psmbrtyp)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "MBRTYP",
        result.psmbrtyp
      );
      result.psmbrtypdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(result.psmbrpre)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "HPPRE",
        result.psmbrpre
      );
      result.psmbrpredsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    return returnSuccess(200, result, res);
  } catch (err) {
    console.log("Error in findOne:", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};

// exports.get = async (req, res) => {
//   const username = req.user.psusrunm;
//   if (!username || username == "") {
//     return returnError(req, 400, "RECORDIDISREQUIRED", res);
//   }

//   try {
//     const member = await psmbrprf.findOne({
//       where: { psusrnme: username },
//       raw: true,
//     });

//     if (!member) return returnError(req, 400, "NORECORDFOUND", res);
//     if (!_.isEmpty(result.psmbrtyp)) {
//       let description = await common.retrieveSpecificGenCodes(
//         req,
//         "MBRTYP",
//         member.psmbrtyp
//       );
//       member.psmbrtypdsc =
//         description.prgedesc && !_.isEmpty(description.prgedesc)
//           ? description.prgedesc
//           : "";
//     }

//     if (!_.isEmpty(member.psmbrpre)) {
//       let description = await common.retrieveSpecificGenCodes(
//         req,
//         "HPPRE",
//         member.psmbrpre
//       );
//       member.psmbrpredsc =
//         description.prgedesc && !_.isEmpty(description.prgedesc)
//           ? description.prgedesc
//           : "";
//     }

//     return returnSuccess(200, member, res);
//   } catch (err) {
//     console.log("Error in getMemberByUsername:", err);
//     return returnError(req, 500, "UNEXPECTEDERROR", res);
//   }
// };

exports.create = async (req, res) => {
  const { errors, isValid } = validatePsmbrprfInput(req.body, "N");
  if (!isValid) return returnError(req, 400, errors, res);

  const exist = await psmbrprf.findOne({
    where: { psmbreml: req.body.psmbreml },
    raw: true,
  });
  if (exist) return returnError(req, 400, { psmbreml: "RECORDEXIST" }, res);

  let ddlErrors = {};
  let err_ind = false;
  if (!_.isEmpty(req.body.psmbrpre)) {
    let prefixCheck = await common.retrieveSpecificGenCodes(
      req,
      "HPPRE",
      req.body.psmbrpre
    );
    if (!prefixCheck || !prefixCheck.prgedesc) {
      ddlErrors.psmbrpre = "INVALIDDATAVALUE";
      err_ind = true;
    }
  }
  if (err_ind) return returnError(req, 400, ddlErrors, res);

  const linkedUser = await psusrprf.findOne({
    where: { psusrunm: req.body.psusrnme },
    raw: true,
    attributes: ["psusrunm", "psusrnam"],
  });
  if (!linkedUser)
    return returnError(req, 400, { psusrnme: "NORECORDFOUND" }, res);

  // Set Expiry Date to one year from now
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const t = await connection.sequelize.transaction();

  try {
    const code = await common.getNextRunning("MBR");
    const psmbruid = `A${_.padStart(code, 6, "0")}`;

    psmbrprf
      .create(
        {
          psmbruid,
          psmbrnam: req.body.psmbrnam,
          psmbreml: req.body.psmbreml,
          psmbrdob: req.body.psmbrdob,
          psmbrpts: 500,
          psmbracs: 0,
          psmbrtyp: "B",
          psmbrexp: oneYearFromNow,
          psmbrjdt: new Date(),
          psmbrcar: uuidv4(),
          psusrnme: req.body.psusrnme,
          psmbrpre: req.body.psmbrpre,
          psmbrphn: req.body.psmbrphn,
        },
        { transaction: t }
      )
      .then(async (data) => {
        let created = data.get({ plain: true });
        t.commit();

        // common.writeMntLog(
        //     "psmbrprf",
        //     null,
        //     null,
        //     created.psmbruid,
        //     "A",
        //     req.user.psusrunm,
        //     "",
        //     created.psmbruid);

        return returnSuccessMessage(req, 200, "RECORDCREATED", res);
      })
      .catch(async (err) => {
        console.log(err);
        await t.rollback();
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      });
  } catch (err) {
    console.log("Error in create:", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};

exports.update = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (!id || id == "") {
    return returnError(req, 500, "RECORDIDISREQUIRED", res);
  }

  const { errors, isValid } = validatePsmbrprfInput(req.body, "C");
  if (!isValid) return returnError(req, 400, errors, res);

  try {
    const exist = await psmbrprf.findOne({
      where: { psmbruid: id },
      raw: true,
    });

    if (!exist) return returnError(req, 400, "NORECORDFOUND", res);

    // 3. gENCODE Validation
    let ddlErrors = {};
    let err_ind = false;

    if (!_.isEmpty(req.body.psmbrtyp)) {
      let yesorno = await common.retrieveSpecificGenCodes(
        req,
        "MBRTYP",
        req.body.psmbrtyp
      );
      if (!yesorno || !yesorno.prgedesc) {
        ddlErrors.psmbrtyp = "INVALIDDATAVALUE";
        err_ind = true;
      }
    }

    if (!_.isEmpty(req.body.psmbrpre)) {
      let yesorno = await common.retrieveSpecificGenCodes(
        req,
        "HPPRE",
        req.body.psmbrpre
      );
      if (!yesorno || !yesorno.prgedesc) {
        ddlErrors.psmbrpre = "INVALIDDATAVALUE";
        err_ind = true;
      }
    }

    if (err_ind) return returnError(req, 400, ddlErrors, res);
    // Check user existence
    const validateUser = await psusrprf.findOne({
      where: {
        psusrunm: req.body.psusrnme,
      },
      raw: true,
      attributes: ["psusrunm", "psusrnam"],
    });

    if (!validateUser) {
      return returnError(req, 400, { psusrnme: "NORECORDFOUND" }, res);
    }

    await psmbrprf
      .update(
        {
          // psmbruid: reference,
          psmbrnam: req.body.psmbrnam,
          psmbreml: req.body.psmbreml,
          psmbrdob: req.body.psmbrdob,
          // psmbrpts: req.body.psmbrpts,
          // psmbracs: req.body.psmbracs,
          // psmbrtyp: req.body.psmbrtyp,
          // psmbrexp: req.body.psmbrexp,
          psmbrjdt: req.body.psmbrjdt,
          // psmbrcar: req.body.psmbrcar,
          psusrnme: req.body.psusrnme,
          psmbrpre: req.body.psmbrpre,
          psmbrphn: req.body.psmbrphn,
          mntuser: req.user.psusrunm,
        },
        { where: { psmbruid: id } }
      )
      .then(() => {
        common.writeMntLog("psmbrprf", null, null, id, "C", req.user.psusrunm);

        return returnSuccessMessage(req, 200, "UPDATESUCCESSFUL", res);
      })
      .catch((err) => {
        console.log("This is the unx error", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      });
  } catch (err) {
    console.log("Error in update:", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};

exports.delete = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (!id || id == "") {
    return returnError(req, 500, "RECORDIDISREQUIRED", res);
  }

  try {
    const t = await connection.sequelize.transaction();

    const exist = await psmbrprf.findOne({
      where: { psmbruid: id },
      raw: true,
    });

    if (!exist) return returnError(req, 400, "NORECORDFOUND", res);

    await psmbrprf
      .destroy(
        {
          where: { psmbruid: id },
        },
        { transaction: t }
      )
      .then(async () => {
        await psmbrcrt.destroy({
          where: {
            psmbrcar: exist.psmbrcar,
          },
        });

        t.commit();
        common.writeMntLog(
          "psmbrprf",
          null,
          null,
          id,
          "D",
          req.user.psusrunm,
          "",
          id
        );
      })
      .catch((err) => {
        console.log(err);
        t.rollback();
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      });

    return returnSuccessMessage(req, 200, "DELETESUCCESSFUL", res);
  } catch (err) {
    console.log("Error in delete:", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};

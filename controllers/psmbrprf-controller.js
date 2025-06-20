// Import
const db = require("../models");
const _ = require("lodash");

//Table 
const psmbrprf = db.psmbrprf;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");

// Input Validation
const validatePsmbrprfInput = require("../validation/psmbrprf-validation");
const { mntuser } = require("../constant/fieldNames");

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

  const { count, rows } = await psmbrprf.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psmbruid","id"],
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

  return returnSuccess(200, {
    total: count,
    data: rows,
    extra: { file: "psmbrprf", key: ["psmbruid"] },
  }, res);
};

exports.findOne = async (req, res) => {
    const id = req.query.id ? req.query.id : "";
    if (!id || id == "") {
      return returnError(400, "MEMBERIDISREQUIRED", res);
    }
    try {
        const psmbrprf = await psmbrprf.findOne({
            where: { psmbruid: id },
            raw: true,
        });
        
        if (!psmbrprf) return returnError(req, 404, "NORECORDFOUND", res);

        return returnSuccess(200, { data: psmbrprf }, res);

    } catch (err) {
        console.log("Error in findOne:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.create = async (req, res) => {
    const { errors, isValid } = validatePsmbrprfInput(req.body, "A");
    if (!isValid) {
        return returnError(req, 400, errors, res);
    }

    try {
        const exist = await psmbrprf.findOne({
            where: { psmbruid: req.body.psmbruid },
            raw: true,
        });

        if (exist) return returnError(req, 400, {psmbruid: "MEMBEREXISTS"}, res);

        const psmbrprf = await psmbrprf.create(req.body, "A");
        return returnSuccess(req, 200, {[psmbrprf.psmbruid]: "CREATSUCCESSFUL"}, res);

    } catch (err) {
        console.log("Error in create:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.update = async (req, res) => {
    const id = req.query.id ? req.query.id : "";
    if (!id || id == "") {
        return returnError(400, "MEMBERIDISREQUIRED", res);
    }

    const { errors, isValid } = validatePsmbrprfInput(req.body);
    if (!isValid) return returnError(req, 400, errors, res);

    try {
        const exist = await psmbrprf.findOne({
            where: { psmbruid: id },
            raw: true,
        });

        if (!exist) return returnError(req, 404, "NORECORDFOUND", res);

        await psmbrprf.update(
            { 
                ...req.body,
                mntuser: req.user.psusrname
            },
            {where: { psmbruid: id }}
        );
     
        return returnSuccessMessage(req, 200, "UPDATESUCCESSFUL", res);

    } catch (err) {
        console.log("Error in update:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.delete = async (req, res) => {
    const id = req.query.id ? req.query.id : "";
    if (!id || id == "") {
        return returnError(400, "MEMBERIDISREQUIRED", res);
    }

    try {
        const exist = await psmbrprf.findOne({
            where: { psmbruid: id },
            raw: true,
        });

        if (!exist) return returnError(req, 404, "NORECORDFOUND", res);

        await psmbrprf.destroy({ where: { psmbruid: id } });

        return returnSuccessMessage(req, 200, "DELETESUCCESSFUL", res);

    } catch (err) {
        console.log("Error in delete:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}


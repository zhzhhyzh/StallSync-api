const express = require("express");
const router = express.Router();
const _ = require("lodash");
const db = require("../models");

// Models
const psrolpar = db.psrolpar;
const psusrprf = db.psusrprf;
const psmbrprf = db.psmbrprf;
const psstfpar = db.psstfpar;
const psmrcpar = db.psmrcpar;
const psrwdpar = db.psrwdpar;
const psrwddtl = db.psrwddtl;
const psordpar = db.psordpar;


const Op = db.Sequelize.Op;
// Common Functions
const returnSuccess = require("../common/success");
const common = require("../common/common");
const returnError = require("../common/error");

// -- Load Common Authentication -- //
const authenticateRoute = require("../common/authenticate");

// @route   GET api/ddl/general
// @desc    Action Code
// @access  Private
router.get("/general", async (req, res) => {
    let code = req.query.code;
    let direction = req.query.direction;
    if (!code)
        return returnError(req, 400, { code: "GENERALCODEISREQUIRED" }, res);
    let genCodes = await common.retrieveGenCodes(
        req,
        code,
        direction ? direction : ""
    );
    return returnSuccess(200, genCodes, res);
});

// @route   POST api/ddl/psrolpar
// @desc    Courier
// @access  Private
router.get("/psrolpar", authenticateRoute, async (req, res) => {

    psrolpar.findAll({
        // where: option,
        raw: true, attributes: ['psrolcde', 'psroldsc']
    }).then(mbr => {
        if (mbr) return returnSuccess(200, { data: mbr }, res);
        else return returnSuccess(200, { data: [] }, res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 400, "UNEXPECTEDERROR", res);
    });
});

// @route   POST api/ddl/merchantUser
// @desc    Courier
// @access  Private

router.get("/merchantUser", authenticateRoute, async (req, res) => {
    const psmrcuid = req.query.psmrcuid;
    if (!psmrcuid) return returnError(req, 400, "FIELDISREQUIRED", res);

    try {
        // 1. Find all usernames in psstfpar for the given merchant
        const assignedStaff = await psstfpar.findAll({
            where: { psmrcuid },
            attributes: ['psusrunm'],
            raw: true
        });

        const assignedUsernames = assignedStaff.map(u => u.psusrunm);

        // 2. Find all users of type MCH that are NOT in the assignedUsernames
        const availableUsers = await psusrprf.findAll({
            where: {
                psusrtyp: "MCH",
                psusrunm: {
                    [Op.notIn]: assignedUsernames.length > 0 ? assignedUsernames : ['']
                }
            },
            attributes: ["psusrunm", "psusrnam"],
            raw: true
        });

        return returnSuccess(200, { data: availableUsers }, res);
    } catch (err) {
        console.error(err);
        return returnError(req, 400, "UNEXPECTEDERROR", res);
    }
});


// @route   POST api/ddl/availableUser
// @desc    Courier
// @access  Private
router.get("/availableUser", authenticateRoute, async (req, res) => {
    const psstftyp = req.query.psstftyp;
    if (!psstftyp) return returnError(req, 400, "FIELDISREQUIRED", res);

    const psusrtyp = psstftyp == "A" ? "ADM" : "MCH";
    try {
        const usedInStaff = await psstfpar.findAll({
            raw: true,
            attributes: ["psusrunm"]
        });

        const usedInMember = await psmbrprf.findAll({
            raw: true,
            attributes: ["psusrnme"]
        });

        const usedUsernames = [
            ...usedInStaff.map(user => user.psusrunm),
            ...usedInMember.map(user => user.psusrnme)
        ];

        const availableUsers = await psusrprf.findAll({
            where: {
                psusrtyp: psusrtyp,
                psusrunm: {
                    [Op.notIn]: usedUsernames
                }
            },
            raw: true,
            attributes: ["psusrunm", "psusrnam"]
        });

        return returnSuccess(200, { data: availableUsers }, res);
    } catch (err) {
        console.error(err);
        return returnError(req, 400, "UNEXPECTEDERROR", res);
    }
});

// @route   POST api/ddl/psmrcpar
// @desc    Courier
// @access  Private
router.get("/psmrcpar", authenticateRoute, async (req, res) => {
    psmrcpar.findAll({ raw: true, attributes: ["psmrcuid", "psmrcnme"] }).then(result => {
        if (result) return returnSuccess(200, { data: result }, res);
        else return returnSuccess(200, { data: [] }, res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 400, "UNEXPECTEDERROR", res);
    });
});


// @route   GET api/ddl/fieldNames
// @desc    Field names
// @access  Private
router.get("/fieldNames", authenticateRoute, async (req, res) => {
  let fields = require("../constant/fieldNames");
  if (req.query.search && !_.isEmpty('' + req.query.search)) fields = await match(fields, req.query.search);

  // Format
  let keys = Object.keys(fields);
  let newData = [];
  for (var i = 0; i < keys.length; i++) {
    let key = keys[i];
    newData.push({
      field: key,
      description: fields[key]
    });
  }

  newData = newData.sort((a, b) => { return a.field.localeCompare(b.field) });
  for (var i = 0; i < newData.length; i++) {
    newData[i].id = (i + 1);
  }

  return returnSuccess(200, newData, res);
});


router.get("/reward", authenticateRoute, async (req, res) => {
  if (!req.query.psmrcuid) return returnError(req, 500, "RECORDIDISREQUIRED", res);

  let userId = "";
  if (req.user.psusrtyp === "MBR") {
    userId = req.user.psmbruid;
  }

  try {
    // 🔹 1. Find used reward IDs
    const usedRewards = await psordpar.findAll({
      where: {
        psmbruid: userId,
        psordsts: { [Op.ne]: "C" },   // ignore cancelled orders
      },
      attributes: ["psrwduid"],
      raw: true,
    });

    const usedRewardIds = usedRewards.map((r) => r.psrwduid);

    // 🔹 2. Find merchant-specific reward IDs
    const merchantRewardIds = await psrwddtl.findAll({
      where: {
        psmrcuid: req.query.psmrcuid,
      },
      attributes: ["psrwduid"],
      raw: true,
    });

    const applicableRewardIds = merchantRewardIds.map((r) => r.psrwduid);

    // 🔹 3. Get available rewards:
    // - (merchant-specific AND in applicableRewardIds) OR (global psrwdaam = 'Y')
    // - exclude rewards in usedRewardIds
    const { count, rows } = await psrwdpar.findAndCountAll({
      where: {
        psrwdsts: "A",
        [Op.and]: [
          {
            [Op.or]: [
              { psrwduid: { [Op.in]: applicableRewardIds } },
              { psrwdaam: "Y" }, // all-merchant reward
            ],
          },
          {
            psrwduid: { [Op.notIn]: usedRewardIds.length ? usedRewardIds : [null] },
          },
        ],
      },
      attributes: ["psrwduid", "psrwdnme", "psrwddsc", "psrwdtyp"],
      order: [["psrwduid", "asc"]],
      raw: true,
    });

    const newRows = [];

    for (let obj of rows) {
      if (!_.isEmpty(obj.psrwdtyp)) {
        const desc = await common.retrieveSpecificGenCodes(req, "DISTYPE", obj.psrwdtyp);
        obj.psrwdtypdsc = desc?.prgedesc || "";
      }
      newRows.push(obj);
    }

    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psrwdpar", key: ["psrwduid"] },
      },
      res
    );
  } catch (err) {
    console.error("Error in /reward:", err);
    return returnError(req, 500, "INTERNAL_SERVER_ERROR", res);
  }
});



module.exports = router;

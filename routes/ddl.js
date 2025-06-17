const express = require("express");
const router = express.Router();
const _ = require("lodash");
const db = require("../models");

// Models
const psrolpar = db.psrolpar;
const psusrprf = db.psusrprf;



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

    psusrprf.findAll({
        where: {
            psusrtyp: "MCH"
        }, raw: true, attributes: ["psusrunm", "psusrnam"]
    }).then(mbr => {
        if (mbr) return returnSuccess(200, { data: mbr }, res);
        else return returnSuccess(200, { data: [] }, res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 400, "UNEXPECTEDERROR", res);
    });

});

module.exports = router;

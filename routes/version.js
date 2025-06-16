const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
// -- Load Controller -- //
// -- Load Models -- //
const db = require("../models");
const version = db.version;

// -- Load Common -- //
const returnSuccess = require("../common/success");
const returnError = require("../common/error");

// @route   GET api/gentyp/find-one
// @desc    Find General Type
// @access  Private
router.get("/version", async (req, res) => {
    let ver = await version.findOne({ raw: true });
    if (ver)
        return returnSuccess(200, ver, res);
    else return returnError(req, 500, "NORECORDFOUND", res);
});

module.exports = router;
const express = require('express');
const router = express.Router();
const _ = require("lodash");

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const prsyspar = require("../controllers/pssyspar-controller");

// @route   GET api/prsyspar/find-one
// @desc    Find System Parameter
// @access  Private
router.get("/detail", authenticateRoute, prsyspar.findOne);

module.exports = router;

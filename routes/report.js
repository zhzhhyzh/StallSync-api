const express = require('express');
const router = express.Router();

// -- Load Model -- //
const reporting = require("../controllers/report-controller");

// -- Load Common Functions -- //
const authenticateRoute = require('../common/authenticate');

// @route   GET api/depts/list
// @desc    List Department
// @access  Private
router.get("/list", authenticateRoute, reporting.list);

// @route   POST api/reporting/download
// @desc    Download Document
// @access  Private
router.get("/download", authenticateRoute, reporting.download);

// @route   POST api/reporting/caseReport
// @desc    Generate Case Report
// @access  Private
router.post("/generate", authenticateRoute, reporting.generate);

// @route   POST api/reporting/forecast
// @desc    forecast Case Report
// @access  Private
router.get("/forecast", authenticateRoute, reporting.forecast);

module.exports = router;
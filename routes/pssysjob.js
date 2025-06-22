const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const pssysjob = require("../controllers/sysjob-controller");

// @route   GET api/pssysjob/list
// @desc    List System Job
// @access  Private
router.get("/list", authenticateRoute, pssysjob.list);

module.exports = router;
const express = require('express');
const { authenticate } = require('passport');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');

// -- Load Controller -- //
const dashboard = require("../controllers/dashboard-controller");

// @route   GET api/dashboard/main
// @desc    Get Main Dashboard
// @access  Public
router.get("/main", authenticateRoute, dashboard.main);

// @route   GET api/dashboard/getTop10PersonsBySales
// @desc    getTop10PersonsBySales
// @access  Public
router.get("/getTopMerchants", authenticateRoute, dashboard.getTopMerchants);




module.exports = router;
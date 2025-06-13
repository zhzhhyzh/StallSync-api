const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psordpar = require("../controllers/psordpar-controller");

// @route   GET api/psordpar/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, psordpar.findOne);

// @route   GET api/psordpar/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, psordpar.list);

// @route   POST api/psordpar/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, psordpar.create);

// @route   POST api/psordpar/update_paid
// @desc    update_paid OTP Parameter
// @access  Private
router.post("/update_paid", authenticateRoute, psordpar.update_paid);

// @route   POST api/psordpar/update_cancelled
// @desc    update_cancelled OTP Parameter
// @access  Private
router.post("/update_cancelled", authenticateRoute, psordpar.update_cancelled);

// @route   POST api/psordpar/update_completed
// @desc    update_completed OTP Parameter
// @access  Private
router.post("/update_completed", authenticateRoute, psordpar.update_completed);

// @route   POST api/psordpar/update_preparing
// @desc    update_preparing OTP Parameter
// @access  Private
router.post("/update_preparing", authenticateRoute, psordpar.update_preparing);

module.exports = router;
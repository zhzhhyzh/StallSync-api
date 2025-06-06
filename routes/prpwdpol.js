const express = require('express');
const router = express.Router();

// -- Load Model -- //
const prpwdpol = require("../controllers/pwdpol-controller");

// -- Load Common Functions -- //
const authenticateRoute = require('../common/authenticate');

// @route   GET api/pwdpol/list
// @desc    List Password Policy
// @access  Private
// router.get("/list", authenticateRoute, prpwdpol.list);

// @route   GET api/pwdpol/detail
// @desc    Password Policy Detail
// @access  Private
router.get("/detail", authenticateRoute, prpwdpol.findOne);

// @route   POST api/pwdpol/create
// @desc    Create Password Policy
// @access  Private
// router.post("/create", authenticateRoute, prpwdpol.create);

// @route   POST api/pwdpol/update
// @desc    Edit Password Policy
// @access  Private
router.post("/update", authenticateRoute, prpwdpol.update);

// @route   POST api/pwdpol/delete
// @desc    Delete Password Policy
// @access  Private
// router.post("/delete", authenticateRoute, prpwdpol.delete);

module.exports = router;
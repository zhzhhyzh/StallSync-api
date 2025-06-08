const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psstfpar = require("../controllers/psstfpar-controller");

// @route   GET api/psstfpar/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, psstfpar.findOne);

// @route   GET api/psstfpar/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, psstfpar.list);

// @route   POST api/psstfpar/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, psstfpar.create);

// @route   POST api/psstfpar/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, psstfpar.delete);

// @route   POST api/psstfpar/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, psstfpar.update);

module.exports = router;
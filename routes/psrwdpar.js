const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psrwdpar = require("../controllers/psrwdpar-controller");

// @route   GET api/psrwdpar/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, psrwdpar.findOne);

// @route   GET api/psrwdpar/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, psrwdpar.list);

// @route   POST api/psrwdpar/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, psrwdpar.create);

// @route   POST api/psrwdpar/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, psrwdpar.delete);

// @route   POST api/psrwdpar/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, psrwdpar.update);

module.exports = router;
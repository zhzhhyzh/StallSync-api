const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const pssysann = require("../controllers/pssysann-controller");

// @route   GET api/pssysann/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, pssysann.findOne);

// @route   GET api/pssysann/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, pssysann.list);

// @route   POST api/pssysann/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, pssysann.create);

// @route   POST api/pssysann/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, pssysann.delete);

// @route   POST api/pssysann/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, pssysann.update);

module.exports = router;
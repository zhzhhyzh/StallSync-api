const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psprdpar = require("../controllers/psprdpar-controller");

// @route   GET api/psprdpar/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, psprdpar.findOne);

// @route   GET api/psprdpar/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, psprdpar.list);

// @route   POST api/psprdpar/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, psprdpar.create);

// @route   POST api/psprdpar/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, psprdpar.delete);

// @route   POST api/psprdpar/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, psprdpar.update);

module.exports = router;
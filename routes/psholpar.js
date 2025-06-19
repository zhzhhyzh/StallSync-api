const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psholpar = require("../controllers/psholpar-controller");

// @route   GET api/psholpar/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, psholpar.findOne);

// @route   GET api/psholpar/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, psholpar.list);

// @route   POST api/psholpar/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, psholpar.create);

// @route   POST api/psholpar/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, psholpar.delete);

// @route   POST api/psholpar/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, psholpar.update);

module.exports = router;
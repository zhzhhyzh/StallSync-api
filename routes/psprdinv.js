const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psprdinv = require("../controllers/psprdinv-controller");

// @route   GET api/psprdinv/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, psprdinv.findOne);

// @route   GET api/psprdinv/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, psprdinv.list);

// @route   POST api/psprdinv/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, psprdinv.create);

// @route   POST api/psprdinv/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, psprdinv.delete);

// // @route   POST api/psprdinv/update
// // @desc    Update OTP Parameter
// // @access  Private
// router.post("/update", authenticateRoute, psprdinv.update);

module.exports = router;
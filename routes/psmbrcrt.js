const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psmbrcrt = require("../controllers/psmbrcrt-controller");

// @route   GET api/psmbrcrt/find-one
// @desc    Find OTP Parameter
// @access  Private
// router.get("/detail", authenticateRoute, psmbrcrt.findOne);

// @route   GET api/psmbrp  rf/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, psmbrcrt.list);

// @route   POST api/psmbrcrt/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, psmbrcrt.create);

// @route   POST api/psmbrcrt/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, psmbrcrt.delete);

// @route   POST api/psmbrcrt/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, psmbrcrt.update);

module.exports = router;
const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psodrrvw = require("../controllers/psodrrvw-controller");

// // @route   GET api/psodrrvw/find-one
// // @desc    Find OTP Parameter
// // @access  Private
// router.get("/detail", authenticateRoute, psodrrvw.findOne);

// @route   GET api/psmbrp  rf/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, psodrrvw.list);

// @route   POST api/psodrrvw/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, psodrrvw.create);

// @route   POST api/psodrrvw/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, psodrrvw.delete);

// @route   POST api/psodrrvw/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, psodrrvw.update);

module.exports = router;
const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const pswdypar = require("../controllers/pswdypar-controller");

// @route   GET api/pswdypar/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, pswdypar.findOne);

// @route   GET api/pswdypar/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, pswdypar.list);

// @route   POST api/pswdypar/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, pswdypar.create);

// @route   POST api/pswdypar/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, pswdypar.delete);

// @route   POST api/pswdypar/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, pswdypar.update);

module.exports = router;
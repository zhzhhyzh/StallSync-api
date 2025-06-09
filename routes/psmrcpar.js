const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psmrcpar = require("../controllers/psmrcpar-controller");

// @route   GET api/psmrcpar/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, psmrcpar.findOne);

// @route   GET api/psmrcpar/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, psmrcpar.list);

// @route   POST api/psmrcpar/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, psmrcpar.create);

// @route   POST api/psmrcpar/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, psmrcpar.delete);

// @route   POST api/psmrcpar/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, psmrcpar.update);

module.exports = router;
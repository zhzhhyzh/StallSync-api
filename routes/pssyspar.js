const express = require('express');
const router = express.Router();
const _ = require("lodash");

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const prsyspar = require("../controllers/pssyspar-controller");

// @route   GET api/prsyspar/find-one
// @desc    Find System Parameter
// @access  Private
router.get("/detail", authenticateRoute, prsyspar.findOne);

// @route   GET api/prsyspar/list
// @desc    List System Parameter
// @access  Private
// router.get("/list", authenticateRoute, prsyspar.list);

// // @route   POST api/prsyspar/create
// // @desc    Create System Parameter
// // @access  Private
// router.post("/create", authenticateRoute, prsyspar.create);

// // @route   POST api/prsyspar/delete
// // @desc    Delete System Parameter
// // @access  Private
// router.post("/delete", authenticateRoute, prsyspar.delete);

// // @route   POST api/prsyspar/update
// // @desc    Update System Parameter
// // @access  Private
// router.post("/update", authenticateRoute, prsyspar.update);

module.exports = router;

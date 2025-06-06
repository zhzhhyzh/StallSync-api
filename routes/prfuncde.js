const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const funcde = require("../controllers/function-controller");

// @route   GET api/funcde/detail
// @desc    Get Function Detail
// @access  Private
router.get("/detail", authenticateRoute, funcde.findOne);

// @route   GET api/funcde/list
// @desc    List Functions
// @access  Private
router.get("/list", authenticateRoute, funcde.list);

// @route   POST api/funcde/create
// @desc    Create Function
// @access  Private
router.post("/create", authenticateRoute, funcde.create);

// @route   POST api/funcde/delete
// @desc    Delete Function
// @access  Private
router.post("/delete", authenticateRoute, funcde.delete);

// @route   POST api/funcde/update
// @desc    Update Function
// @access  Private
router.post("/update", authenticateRoute, funcde.update);

module.exports = router;
const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const funacs = require("../controllers/access-controller");

// @route   GET api/funcde/detail
// @desc    Get Function Detail
// @access  Private
// router.get("/detail", authenticateRoute, funcde.findOne);

// @route   GET api/funcde/list
// @desc    List Functions
// @access  Private
router.get("/list", authenticateRoute, funacs.list);

// @route   GET api/funcde/list
// @desc    List Functions
// @access  Private
router.get("/list_role", authenticateRoute, funacs.list_role);
// @route   POST api/funcde/action
// @desc    Function Access Action
// @access  Private
router.post("/action", authenticateRoute, funacs.action);

// @route   POST api/funcde/delete
// @desc    Delete Function
// @access  Private
// router.post("/delete", authenticateRoute, funcde.delete);

// @route   POST api/funcde/update
// @desc    Update Function
// @access  Private
// router.post("/update", authenticateRoute, funcde.update);

module.exports = router;
const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const mntlogpf = require("../controllers/mntlog-controller");

// @route   GET api/mntlog/find-one
// @desc    Find Maintenance Log
// @access  Private
router.get("/detail", authenticateRoute, mntlogpf.findOne);

// @route   GET api/mntlog/list
// @desc    List Maintenance Log
// @access  Private
router.get("/list", authenticateRoute, mntlogpf.list);

// @route   GET api/mntlog/sub_list
// @desc    List Sub Maintenance Log
// @access  Private
router.get("/sub_list", authenticateRoute, mntlogpf.sub_list);


module.exports = router;

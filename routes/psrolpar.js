const express = require('express');
const router = express.Router();
const _ = require("lodash");

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psrolpar = require("../controllers/psrolpar-controller");

// @route   GET api/psrolpar/detail
// @desc    Find Table
// @access  Private
router.get("/detail", authenticateRoute, psrolpar.findOne);

// @route   GET api/psrolpar/list
// @desc    List Table
// @access  Private
router.get("/list", authenticateRoute, psrolpar.list);

// @route   POST api/psrolpar/create
// @desc    Create Table
// @access  Private
router.post("/create", authenticateRoute, psrolpar.create);

// @route   POST api/psrolpar/delete
// @desc    Table Delete
// @access  Private
router.post("/delete", authenticateRoute, psrolpar.delete);

// @route   POST api/psrolpar/update
// @desc    Table Update
// @access  Private
router.post("/update", authenticateRoute, psrolpar.update);

module.exports = router;

const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const gentyp = require("../controllers/gentyp-controller");

// @route   GET api/gentyp/find-one
// @desc    Find General Type
// @access  Private
router.get("/detail", authenticateRoute, gentyp.findOne);

// @route   GET api/gentyp/list
// @desc    List General Type
// @access  Private
router.get("/list", authenticateRoute, gentyp.list);

// @route   POST api/gentyp/create
// @desc    Create General Type
// @access  Private
router.post("/create", authenticateRoute, gentyp.create);

// @route   POST api/gentyp/delete
// @desc    General Type Delete
// @access  Private
router.post("/delete", authenticateRoute, gentyp.delete);

// @route   POST api/gentyp/update
// @desc    General Type Update
// @access  Private
router.post("/update", authenticateRoute, gentyp.update);

module.exports = router;
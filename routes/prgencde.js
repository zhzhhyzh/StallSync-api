const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const gencde = require("../controllers/gencde-controller");

// @route   GET api/gencde/find-one
// @desc    Find General Code
// @access  Private
router.get("/detail", authenticateRoute, gencde.findOne);

// @route   GET api/gencde/list
// @desc    List General Code
// @access  Private
router.get("/list", authenticateRoute, gencde.list);

// @route   POST api/gencde/create
// @desc    Create General Code
// @access  Private
router.post("/create", authenticateRoute, gencde.create);

// @route   POST api/gencde/delete
// @desc    General Code Delete
// @access  Private
router.post("/delete", authenticateRoute, gencde.delete);

// @route   POST api/gencde/update
// @desc    General Code Update
// @access  Private
router.post("/update", authenticateRoute, gencde.update);

module.exports = router;
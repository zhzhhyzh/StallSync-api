const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psordrvw = require("../controllers/psordrvw-controller");

// @route   GET api/psordrvw/find-one
// @desc    Find Order review Parameter
// @access  Private
router.get("/detail", authenticateRoute, psordrvw.findOne);

// @route   GET api/psordrvw/list
// @desc    List Order review Parameter
// @access  Private
router.get("/list", authenticateRoute, psordrvw.list);

// @route   POST api/psordrvw/create
// @desc    Create Order review Parameter
// @access  Private
router.post("/create", authenticateRoute, psordrvw.create);

// @route   POST api/psordrvw/delete
// @desc    Delete Order review Parameter
// @access  Private
router.post("/delete", authenticateRoute, psordrvw.delete);

// @route   POST api/psordrvw/update
// @desc    Update Order review Parameter
// @access  Private
router.post("/update", authenticateRoute, psordrvw.update);

module.exports = router;
const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psrwdpar = require("../controllers/psrwdpar-controller");

// @route   GET api/psrwdpar/find-one
// @desc    Find Rewards Parameter
// @access  Private
router.get("/detail", authenticateRoute, psrwdpar.findOne);

// @route   GET api/psrwdpar/list
// @desc    List Rewards Parameter
// @access  Private
router.get("/list", authenticateRoute, psrwdpar.list);

// @route   POST api/psrwdpar/create
// @desc    Create Rewards Parameter
// @access  Private
router.post("/create", authenticateRoute, psrwdpar.create);

// @route   POST api/psrwdpar/delete
// @desc    Delete Rewards Parameter
// @access  Private
router.post("/delete", authenticateRoute, psrwdpar.delete);

// @route   POST api/psrwdpar/update
// @desc    Update Rewards Parameter
// @access  Private
router.post("/update", authenticateRoute, psrwdpar.update);

// @route   GET api/psrwdpar/listRdmp
// @desc    List redemption Rewards Parameter
// @access  Private
router.get("/listRdmp", authenticateRoute, psrwdpar.listRdmp);

router.get("/listAvailable", authenticateRoute, psrwdpar.listAvailable);

module.exports = router;
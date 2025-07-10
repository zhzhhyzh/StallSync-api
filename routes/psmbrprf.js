const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psmbrprf = require("../controllers/psmbrprf-controller");

// @route   GET api/psmbrprf/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, psmbrprf.findOne);


// @route   GET api/psmbrprf/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, psmbrprf.list);

// @route   POST api/psmbrprf/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", psmbrprf.create);

// @route   POST api/psmbrprf/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, psmbrprf.delete);

// @route   POST api/psmbrprf/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, psmbrprf.update);

router.get("/detailMember", authenticateRoute, psmbrprf.findOneMember);
module.exports = router;
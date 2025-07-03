const express = require('express');
const router = express.Router();
const _ = require("lodash");

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const psusrprf = require("../controllers/psusrprf-controller");

// @route   POST api/psusrprf/login
// @desc    Find System Parameter
// @access  Private
router.post("/login", psusrprf.login);

// @route   POST api/psusrprf/login
// @desc    Find System Parameter
// @access  Private
router.post("/login_m", psusrprf.login_m);

// @route   POST api/psusrprf/reset
// @desc    Reset Password
// @access  Public
router.post('/reset', psusrprf.reset);

// @route   GET api/psusrprf/profile
// @desc    User Profile
// @access  Private
router.get('/profile', authenticateRoute, psusrprf.profile);

// @route   POST api/psusrprf/change-password
// @desc    Update user Password
// @access  Public
router.post('/change_password', authenticateRoute, psusrprf.change_password);

// @route   POST api/psusrprf/create
// @desc    create System Parameter
// @access  Private
router.post("/create", psusrprf.create);

// // @route   POST api/psusrprf/update-profile
// // @desc    Update user Profile
// // @access  Public
router.post('/update_profile', authenticateRoute, psusrprf.update_profile);

// @route   GET api/psusrprf/list
// @desc    List System Parameter
// @access  Private
router.get("/list", authenticateRoute, psusrprf.list);

// @route   GET api/psusrprf/detail
// @desc    List System Parameter
// @access  Private
router.get("/detail", authenticateRoute, psusrprf.detail);

// @route   POST api/psusrprf/update
// @desc    update System Parameter
// @access  Private
router.post("/update", authenticateRoute, psusrprf.update);

// @route   POST api/psusrprf/reset
// @desc    Reset password System Parameter
// @access  Private
router.post("/reset", authenticateRoute, psusrprf.reset);

// @route   POST api/psusrprf/delete
// @desc    delete System Parameter
// @access  Private
router.post("/delete", authenticateRoute, psusrprf.delete);

// @route   GET api/psusrprf/home
// @desc    Home API
// @access  Private
router.get("/home", authenticateRoute, psusrprf.home);


module.exports = router;
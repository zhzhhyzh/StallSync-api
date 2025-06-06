const express = require('express');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const pstblmas = require("../controllers/pstblmas-controller");

// @route   GET api/pstblmas/detail
// @desc    Find Table
// @access  Private
router.get("/detail", authenticateRoute, pstblmas.findOne);

// @route   GET api/pstblmas/list
// @desc    List Table
// @access  Private
router.get("/list", authenticateRoute, pstblmas.list);

// @route   POST api/pstblmas/create
// @desc    Create Table
// @access  Private
router.post("/create", authenticateRoute, pstblmas.create);

// @route   POST api/pstblmas/delete
// @desc    Table Delete
// @access  Private
router.post("/delete", authenticateRoute, pstblmas.delete);

// @route   POST api/pstblmas/update
// @desc    Table Update
// @access  Private
router.post("/update", authenticateRoute, pstblmas.update);


// @route   GET api/pstblmas/detail
// @desc    Find Key Information
// @access  Private
router.get("/key_detail", authenticateRoute, pstblmas.key_detail);

// @route   GET api/pstblmas/list
// @desc    List Table's Keys
// @access  Private
router.get("/key_list", authenticateRoute, pstblmas.key_list);

// @route   POST api/pstblmas/create
// @desc    Create Table's Key
// @access  Private
router.post("/key_create", authenticateRoute, pstblmas.key_create);

// @route   POST api/pstblmas/delete
// @desc    Delete Table's Key
// @access  Private
router.post("/key_delete", authenticateRoute, pstblmas.key_delete);

// @route   POST api/pstblmas/update
// @desc    Update Table's Key
// @access  Private
router.post("/key_update", authenticateRoute, pstblmas.key_update);

module.exports = router;

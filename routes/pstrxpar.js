const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// -- Load Common Authentication -- //
const authenticateRoute = require("../common/authenticate");
// -- Load Controller -- //
const pstrxpar = require("../controllers/pstrxpar-controller");

// @route   GET api/pstrxpar/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, pstrxpar.findOne);

// @route   GET api/pstrxpar/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, pstrxpar.list);

// @route   POST api/pstrxpar/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, pstrxpar.create);

// @route   POST api/pstrxpar/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, pstrxpar.delete);

// @route   POST api/pstrxpar/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, pstrxpar.update);

router.post("/create-checkout-session", authenticateRoute, pstrxpar.createStripeSession);


module.exports = router;

const express = require('express');
const { authenticate } = require('passport');
const router = express.Router();

// -- Load Common Authentication -- //
const authenticateRoute = require('../common/authenticate');
// -- Load Controller -- //
const document = require("../controllers/document-controller");

// Temporary Upload -- Start
// @route   GET api/document/detail
// @desc    Get Document
// @access  Private
router.get("/detail", document.detail);

// @route   POST api/document/upload
// @desc    Upload Document
// @access  Private
router.post("/upload", document.upload);

// @route   POST api/document/remove
// @desc    Remove Document
// @access  Private
router.post("/remove", document.remove);
// Temporary Upload -- End
// @route   POST api/document/bulk_upload
// @desc    Bulk Upload Documents
// @access  Private
router.post("/bulk_upload", document.bulk_upload);

// @route   POST api/document/download
// @desc    Download Document
// @access  Private
router.post("/download", document.download);

module.exports = router;

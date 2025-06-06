// Import
const db = require("../models");
const _ = require("lodash");
const bcrypt = require('bcryptjs');
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");

// Table File
const pssyspar = db.pssyspar;

// Common Function
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');
const general = require("../common/general");
const connection = require("../common/db");
const genConfig = require("../constant/generalConfig");

// Input Validation
//const validatePssysparInput = require('../validation/pssyspar-validation');

exports.findOne = async (req, res) => {
    pssyspar.findOne({
        raw: true, 
        attributes:['pscomnme', 'pscomidn', 'psvchmax', 'psdrvmax', 'pstrknod', 'pstrkxod', 'pslotime']
    }).then(async syspar => {
        if (syspar) {
            return returnSuccess(200, syspar, res);
        } else return returnError(req, 500, "NORECORDFOUND", res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}
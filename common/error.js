const errorMessageCN = require('../constant/errorMessageCN');
const errorMessage = require('../constant/errorMessage');
const fieldNames = require('../constant/fieldNames');
const generalFunction = require('../common/general');
const _ = require("lodash");
// Import
const db = require("../models");

// Table File
const errlogpf = db.errlogpf;
const common = require("./common");

module.exports = function returnError(req, status, code, res, specialCode, specialMessage, extra, ref, api) {

  const errors = {};
  if (req.headers['locale'] !== '' && req.headers['locale'] !== undefined && req.headers['locale'] !== null) {
    var locale = req.headers['locale'].toLowerCase();
  } else {
    var locale = 'en';
  }
  if (specialCode && specialCode != '' && specialMessage && specialMessage != '') {
    errors.result = 'error';
    errors.code = specialCode;
    errors.message = {
      error: specialMessage
    }
    errors.extra = extra;
    return res.status(status).json(errors); // send the error response to client
  } else {
    if (status == '400' || status == 400) {
      let errorpf = {
        api: req.originalUrl,
        error_code: JSON.stringify(code),
        incoming: JSON.stringify(req.body),
        caller: req.user ? req.user.psusrunm ? req.user.psusrunm : '' : ''
      };

      Object.keys(code).forEach((key) => {
        let tempCode = code[key];
        let par = tempCode.indexOf('&') > 0 ? tempCode.split('&') : tempCode;
        let field = tempCode.indexOf('#') > 0 ? tempCode.split('#') : tempCode;
        if (code[key].indexOf('&') > 0) {
          if (locale == 'en') {
            if (errorMessage[par[0]]) code[key] = errorMessage[par[0]].replace('&length', par[1])
            else code[key]
          } else {
            if (errorMessageCN[par[0]]) code[key] = errorMessageCN[par[0]].replace('&length', par[1])
            else code[key]
          }
        } else if (code[key].indexOf('#') > 0) {
          if (locale == 'en') {
            if (errorMessage[field[0]]) code[key] = errorMessage[field[0]].replace('#field', fieldNames[field[1]])
            else code[key]
          } else {
            if (errorMessageCN[field[0]]) code[key] = errorMessageCN[field[0]].replace('#field', fieldNames[field[1]])
            else code[key]
          }
        } else {
          if (locale == 'en') {
            if (errorMessage[code[key]])
              code[key] = errorMessage[code[key]];
            else code[key];
          } else {
            if (errorMessageCN[code[key]])
              code[key] = errorMessageCN[code[key]];
            else code[key];
          }
        }
      });

      errors.message = code;
      errorpf.error_desc = JSON.stringify(code);
      errlogpf.create(errorpf);
    } else {
      if (locale == 'en') {
        errors.code = code;
        errors.message = {
          error: errorMessage[code]
        }
      } else {
        errors.code = code;
        errors.message = {
          error: errorMessageCN[code]
        }
      }

      errlogpf.create({
        api: req.originalUrl,
        error_code: errors.code,
        error_desc: errors.message.error,
        incoming: JSON.stringify(req.body),
        caller: req.user ? req.user.psusrunm ? req.user.psusrunm : '' : ''
      });
    }
    errors.result = 'error';
    errors.extra = extra;

    if (ref && !_.isEmpty(ref)) {
      // Write History Log
      common.writeLog(api, JSON.stringify(errors), "OUT", ref, req.user.psusrunm, "FAIL");
    }

    return res.status(status).json(errors); // send the error response to client
  }
};

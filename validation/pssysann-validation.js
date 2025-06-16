const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateSysannInput(data, type) {
  let errors = {};
  data.psannttl = !isEmpty(data.psannttl) ? data.psannttl : '';
  data.psannmsg = !isEmpty(data.psannmsg) ? data.psannmsg : '';
  data.psanntyp = !isEmpty(data.psanntyp) ? data.psanntyp : '';
  data.psannsts = !isEmpty(data.psannsts) ? data.psannsts : '';
  // data.psannnot = !isEmpty(data.psannnot) ? data.psannnot : '';

  if (type == 'A' && Validator.isEmpty(data.psannttl)) {
    errors.psannttl = "FIELDISREQUIRED";
  } else if (type == 'A' && !Validator.isEmpty(data.psannttl) && data.psannttl.length > 50)
    errors.psannttl = "INVALIDVALUELENGTH&50";

  if (Validator.isEmpty(data.psannmsg)) {
    errors.psannmsg = "FIELDISREQUIRED";
  } 

  if (Validator.isEmpty(data.psanntyp)) {
    errors.psanntyp = "FIELDISREQUIRED";
  } else {
    if (data.psanntyp.length > 3)
      errors.psanntyp = "INVALIDVALUELENGTH&3";
  }

  if (Validator.isEmpty(data.psannsts)) {
    errors.psannsts = "FIELDISREQUIRED";
  } else {
    if (data.psannsts.length > 1)
      errors.psannsts = "INVALIDVALUELENGTH&1";
  }

  // if (Validator.isEmpty(data.psannnot)) {
  //   errors.psannnot = "FIELDISREQUIRED";
  // } else {
  //   if (data.psannnot.length > 1)
  //     errors.psannnot = "INVALIDVALUELENGTH&1";
  // }

  return {
    errors,
    isValid: isEmpty(errors)
  }
};

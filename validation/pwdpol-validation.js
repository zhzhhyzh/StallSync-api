const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateDeptInput(data, type) {
  let errors = {};
  data.id = !isEmpty(data.id) ? data.id : 0;
  data.prpwdatm = !isEmpty(data.prpwdatm) ? data.prpwdatm : 0;
  data.pratmmsg = !isEmpty(data.pratmmsg) ? data.pratmmsg : '';
  data.prpwdlen = !isEmpty(data.prpwdlen) ? data.prpwdlen : 0;
  data.prlenmsg = !isEmpty(data.prlenmsg) ? data.prlenmsg : '';
  data.prpwdfrq = !isEmpty(data.prpwdfrq) ? data.prpwdfrq : 0;
  data.prfrqmsg = !isEmpty(data.prfrqmsg) ? data.prfrqmsg : '';
  data.prpwdupc = !isEmpty(data.prpwdupc) ? data.prpwdupc : false;
  data.prupcmsg = !isEmpty(data.prupcmsg) ? data.prupcmsg : '';
  data.prpwdlwc = !isEmpty(data.prpwdlwc) ? data.prpwdlwc : false;
  data.prlwcmsg = !isEmpty(data.prlwcmsg) ? data.prlwcmsg : '';
  data.prpwdspc = !isEmpty(data.prpwdspc) ? data.prpwdspc : false;
  data.prspcmsg = !isEmpty(data.prspcmsg) ? data.prspcmsg : '';
  data.prspcchr = !isEmpty(data.prspcchr) ? data.prspcchr : '';
  data.prscrmsg = !isEmpty(data.prscrmsg) ? data.prscrmsg : '';
  data.prpwdnum = !isEmpty(data.prpwdnum) ? data.prpwdnum : false;
  data.prnummsg = !isEmpty(data.prnummsg) ? data.prnummsg : '';

  if (data.id == 0 && type == 'C') {
    errors.id = "RECORDIDISREQUIRED";
  }
  if (data.prpwdatm > 0) {
    if (Validator.isEmpty(data.pratmmsg)) {
      errors.pratmmsg = "FIELDISREQUIRED";
    }
    if (data.pratmmsg.length > 50) errors.pratmmsg = "INVALIDVALUELENGTH&50";
  }
  if (data.prpwdlen > 0) {
    if (Validator.isEmpty(data.prlenmsg)) {
      errors.prlenmsg = "FIELDISREQUIRED";
    }
    if (data.prlenmsg.length > 50) errors.prlenmsg = "INVALIDVALUELENGTH&50";
  }
  if (data.prpwdfrq > 0) {
    if (Validator.isEmpty(data.prfrqmsg)) {
      errors.prfrqmsg = "FIELDISREQUIRED";
    }
    if (data.prfrqmsg.length > 50) errors.prfrqmsg = "INVALIDVALUELENGTH&50";
  }
  if (data.prpwdupc) {
    if (Validator.isEmpty(data.prupcmsg)) {
      errors.prupcmsg = "FIELDISREQUIRED";
    }
    if (data.prupcmsg.length > 50) errors.prupcmsg = "INVALIDVALUELENGTH&50";
  }
  if (data.prpwdlwc) {
    if (Validator.isEmpty(data.prlwcmsg)) {
      errors.prlwcmsg = "FIELDISREQUIRED";
    }
    if (data.prlwcmsg.length > 50) errors.prlwcmsg = "INVALIDVALUELENGTH&50";
  }
  if (data.prpwdspc) {
    if (Validator.isEmpty(data.prspcmsg)) {
      errors.prspcmsg = "FIELDISREQUIRED";
    }
    if (data.prspcmsg.length > 50) errors.prspcmsg = "INVALIDVALUELENGTH&50";
  }
  if (Validator.isEmpty(data.prspcchr)) {
    if (data.prpwdspc) errors.prspcchr = "FIELDISREQUIRED";
    else {
      if (Validator.isEmpty(data.prscrmsg))
        data.prscrmsg = "FIELDISREQUIRED"
      if (data.prscrmsg.length > 50) errors.prscrmsg = "INVALIDVALUELENGTH&50";
    }
    if (data.prspcchr.length > 35) errors.prspcchr = "INVALIDVALUELENGTH&35";
  }
  if (data.prpwdnum) {
    if (Validator.isEmpty(data.prnummsg)) {
      errors.prnummsg = "FIELDISREQUIRED";
    }
    if (data.prnummsg.length > 50) errors.prnummsg = "INVALIDVALUELENGTH&50";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
};

const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function prResetPassValidation(data) {
  let errors = {};

  // data.oldpassword = !isEmpty(data.oldpassword) ? data.oldpassword : '';
  data.newpassword = !isEmpty(data.newpassword) ? data.newpassword : '';
  data.conpassword = !isEmpty(data.conpassword) ? data.conpassword : '';

  // if (Validator.isEmpty(data.oldpassword)) {
  //   errors.oldpassword = "FIELDISREQUIRED";
  // }
  if (Validator.isEmpty(data.newpassword)) {
    errors.newpassword = "FIELDISREQUIRED";
  } else {
    if (data.newpassword.length > 100) errors.newpassword = 'INVALIDVALUELENGTH&100';
    if (data.oldpassword == data.newpassword) {
      errors.newpassword = "PASSWORDCANNOTSAME"
    }
  }

  if (Validator.isEmpty(data.conpassword)) {
    errors.conpassword = "FIELDISREQUIRED";
  } else if (data.newpassword != data.conpassword) {
    errors.conpassword = "PASSWORDMNOTMATCH"
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
};

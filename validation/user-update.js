const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function prUpdateProfileValidation(data, action) {
  if (!action) action = '';

  let errors = {};
  data.psusrnam = !isEmpty(data.psusrnam) ? data.psusrnam : '';
  data.psusreml = !isEmpty(data.psusreml) ? data.psusreml : '';
  data.psusrphn = !isEmpty(data.psusrphn) ? data.psusrphn : '';
  data.psusrsts = !isEmpty(data.psusrsts) ? data.psusrsts : '';
  // data.psredind = !isEmpty(data.psredind) ? data.psredind : '';

  if (Validator.isEmpty(data.psusrnam)) {
    errors.psusrnam = "FIELDISREQUIRED";
  } else {
    if (data.psusrnam.length > 50) errors.psusrnam = 'INVALIDVALUELENGTH&50';
  }

  if (Validator.isEmpty(data.psusreml)) {
    errors.psusreml = "FIELDISREQUIRED";
  } else {
    if (data.psusreml.length > 100) errors.mcusreml = 'INVALIDVALUELENGTH&100';
  }

  if (Validator.isEmpty(data.psusrphn)) {
    errors.psusrphn = "FIELDISREQUIRED";
  } else {
    if (data.psusrphn.length > 20) errors.psusrphn = 'INVALIDVALUELENGTH&20';
  }

  if (Validator.isEmpty(data.psusrsts)) {
    errors.psusrsts = "FIELDISREQUIRED";
  } else {
    if (data.psusrsts.length > 1) errors.psusrsts = 'INVALIDVALUELENGTH&1';
  }

  // if (Validator.isEmpty(data.psredind)) {
  //   errors.psredind = "FIELDISREQUIRED";
  // }

  return {
    errors,
    isValid: isEmpty(errors)
  }
};

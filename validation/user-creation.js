const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function userCreationValidation(data, flag) {
  let errors = {};
  if (!flag || isEmpty(flag)) flag = 'Y';

  data.psusrunm = !isEmpty(data.psusrunm) ? data.psusrunm : '';
  data.psusrnam = !isEmpty(data.psusrnam) ? data.psusrnam : '';
  data.psusreml = !isEmpty(data.psusreml) ? data.psusreml : '';
  data.psusrtyp = !isEmpty(data.psusrtyp) ? data.psusrtyp : '';
  data.psusrpwd = !isEmpty(data.psusrpwd) ? data.psusrpwd : '';
  data.psusrphn = !isEmpty(data.psusrphn) ? data.psusrphn : '';
  data.psusrpre = !isEmpty(data.psusrpre) ? data.psusrpre : '';

  if (Validator.isEmpty(data.psusrunm)) {
    errors.psusrunm = "FIELDISREQUIRED";
  } else {
    if (data.psusrunm.length > 255) errors.psusrunm = 'INVALIDVALUELENGTH&255';
  }

  if (Validator.isEmpty(data.psusrpwd)) {
    errors.psusrpwd = "FIELDISREQUIRED";
  } else {
    if (data.psusrpwd.length > 20) errors.psusrpwd = 'INVALIDVALUELENGTH&20';
  }

  if (Validator.isEmpty(data.psusrnam)) {
    errors.psusrnam = "FIELDISREQUIRED";
  } else {
    if (data.psusrnam.length > 50) errors.psusrnam = 'INVALIDVALUELENGTH&50';
  }

  if (Validator.isEmpty(data.psusreml)) {
    errors.psusreml = "FIELDISREQUIRED";
  } else {
    if (data.psusreml.length > 100) errors.psusreml = 'INVALIDVALUELENGTH&100';
  }

  if (Validator.isEmpty(data.psusrtyp) && flag == 'Y') {
    errors.psusrtyp = "FIELDISREQUIRED";
  } else {
    if (data.psusrtyp.length > 10) errors.psusrtyp = 'INVALIDVALUELENGTH&10';
  }

  if (Validator.isEmpty(data.psusrphn)) {
    errors.psusrphn = "FIELDISREQUIRED";
  } else {
    if (data.psusrphn.length > 20) errors.psusrphn = 'INVALIDVALUELENGTH&20';
  }

    if (Validator.isEmpty(data.psusrpre)) {
    errors.psusrpre = "FIELDISREQUIRED";
  } else {
    if (data.psusrpre.length > 20) errors.psusrpre = 'INVALIDVALUELENGTH&20';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
};

module.exports = function memberCreationValidation(data, flag) {
  let errors = {};
  if (!flag || isEmpty(flag)) flag = 'Y';

  data.psusrnam = !isEmpty(data.psusrnam) ? data.psusrnam : '';
  data.psusreml = !isEmpty(data.psusreml) ? data.psusreml : '';
  data.psusrtyp = !isEmpty(data.psusrtyp) ? data.psusrtyp : '';
  data.psusrpwd = !isEmpty(data.psusrpwd) ? data.psusrpwd : '';
  data.psusrphn = !isEmpty(data.psusrphn) ? data.psusrphn : '';
  data.psusrrol = !isEmpty(data.psusrrol) ? data.psusrrol : '';
  data.psusrpre = !isEmpty(data.psusrpre) ? data.psusrpre : '';

  if (Validator.isEmpty(data.psusrpwd)) {
    errors.psusrpwd = "FIELDISREQUIRED";
  } else {
    if (data.psusrpwd.length > 20) errors.psusrpwd = 'INVALIDVALUELENGTH&20';
  }

  if (Validator.isEmpty(data.psusrnam)) {
    errors.psusrnam = "FIELDISREQUIRED";
  } else {
    if (data.psusrnam.length > 50) errors.psusrnam = 'INVALIDVALUELENGTH&50';
  }

  if (Validator.isEmpty(data.psusreml)) {
    errors.psusreml = "FIELDISREQUIRED";
  } else {
    if (data.psusreml.length > 100) errors.psusreml = 'INVALIDVALUELENGTH&100';
  }

  if (Validator.isEmpty(data.psusrtyp) && flag == 'Y') {
    errors.psusrtyp = "FIELDISREQUIRED";
  } else {
    if (data.psusrtyp.length > 10) errors.psusrtyp = 'INVALIDVALUELENGTH&10';
  }

  if (Validator.isEmpty(data.psusrphn)) {
    errors.psusrphn = "FIELDISREQUIRED";
  } else {
    if (data.psusrphn.length > 20) errors.psusrphn = 'INVALIDVALUELENGTH&20';
  }

  if (Validator.isEmpty(data.psusrrol)) {
    errors.psusrrol = "FIELDISREQUIRED";
  }

    if (Validator.isEmpty(data.psusrpre)) {
    errors.psusrpre = "FIELDISREQUIRED";
  } else {
    if (data.psusrpre.length > 20) errors.psusrpre = 'INVALIDVALUELENGTH&20';
  }
  return {
    errors,
    isValid: isEmpty(errors)
  }
};

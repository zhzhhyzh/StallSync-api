const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateFuncdeInput(data, type) {
  let errors = {};
  data.id = !isEmpty(data.id) ? data.id : 0;
  data.prfuncde = !isEmpty(data.prfuncde) ? data.prfuncde : '';
  data.prfunnme = !isEmpty(data.prfunnme) ? data.prfunnme : '';
  data.prfungrp = !isEmpty(data.prfungrp) ? data.prfungrp : '';
  data.prfunsts = !isEmpty('' + data.prfunsts) ? data.prfunsts : '';

  if (data.id == 0 && (type == 'C' || type == 'D')) {
    errors.id = "FIELDISREQUIRED";
  }
  if (type == 'A' && Validator.isEmpty(data.prfuncde)) {
    errors.prfuncde = "FIELDISREQUIRED";
  } else if (type == 'A' && !Validator.isEmpty(data.prfuncde) && data.prfuncde.length > 10)
    errors.prfuncde = "INVALIDVALUELENGTH&10";

  if (Validator.isEmpty(data.prfunnme)) {
    errors.prfunnme = "FIELDISREQUIRED";
  } else {
    if (data.prfunnme.length > 100) errors.prfunnme = 'INVALIDVALUELENGTH&100';
  }

  if (Validator.isEmpty(data.prfungrp)) {
    errors.prfungrp = "FIELDISREQUIRED";
  } else {
    if (data.prfungrp.length > 10) errors.prfungrp = 'INVALIDVALUELENGTH&10';
  }

  if (type == 'C' && Validator.isEmpty('' + data.prfunsts)) {
    errors.prfunsts = "FIELDISREQUIRED";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
};

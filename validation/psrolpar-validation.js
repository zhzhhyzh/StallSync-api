const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePsrolparInput(data, type) {
  let errors = {};
  data.psrolcde = !isEmpty(data.psrolcde) ? data.psrolcde : '';
  data.psroldsc = !isEmpty(data.psroldsc) ? data.psroldsc : '';
  data.psrollds = !isEmpty(data.psrollds) ? data.psrollds : '';
  data.psrolibi = !isEmpty(data.psrolibi) ? data.psrolibi : '';
  data.psrolibm = !isEmpty(data.psrolibm) ? data.psrolibm : '';

  if (Validator.isEmpty(data.psrolcde)) {
    errors.psrolcde = "FIELDISREQUIRED";
  } else {
    if (data.psrolcde.length > 10) errors.psrolcde = 'INVALIDVALUELENGTH&10';
  }

  if (Validator.isEmpty(data.psroldsc)) {
    errors.psroldsc = "FIELDISREQUIRED";
  } else {
    if (data.psroldsc.length > 255) errors.psroldsc = 'INVALIDVALUELENGTH&255';
  }
  // if (Validator.isEmpty(data.psrollds)) {
  //   errors.psrollds = "FIELDISREQUIRED";
  // } else {
    if (data.psrollds.length > 255) errors.psrollds = 'INVALIDVALUELENGTH&255';
  // }
  // if (Validator.isEmpty(data.psrolibi)) {
  //   errors.psrolibi = "FIELDISREQUIRED";
  // } else {
  if (data.psrolibi.length > 10) errors.psrolibi = 'INVALIDVALUELENGTH&10';
  // }
  // if (Validator.isEmpty(data.psrolibm)) {
  //   errors.psrolibm = "FIELDISREQUIRED";
  // } else {
  if (data.psrolibm.length > 10) errors.psrolibm = 'INVALIDVALUELENGTH&10';
  // }



  return {
    errors,
    isValid: isEmpty(errors)
  }
};

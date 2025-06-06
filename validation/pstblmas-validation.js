const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateTblmasInput(data, type) {
  let errors = {};
  data.pstblnme = !isEmpty(data.pstblnme) ? data.pstblnme : '';
  data.pstbltyp = !isEmpty(data.pstbltyp) ? data.pstbltyp : '';
  // data.pstblkey = !isEmpty(data.pstblkey) ? data.pstblkey : '';
  data.pstbldsc = !isEmpty(data.pstbldsc) ? data.pstbldsc : '';
  data.pstbllds = !isEmpty(data.pstbllds) ? data.pstbllds : '';
  data.pstblpnt = !isEmpty(data.pstblpnt) ? data.pstblpnt : '';

  if (Validator.isEmpty(data.pstblnme)) {
    errors.pstblnme = "FIELDISREQUIRED";
  } else {
    if (data.pstblnme.length > 25) errors.pstblnme = 'INVALIDVALUELENGTH&25';
  }

  if (Validator.isEmpty(data.pstbltyp)) {
    errors.pstbltyp = "FIELDISREQUIRED";
  }
  else {
    if (data.pstbltyp.length > 10) errors.pstbltyp = 'INVALIDVALUELENGTH&10';
  }

  // if (Validator.isEmpty(data.pstblkey)) {
  //   errors.pstblkey = "GENDESCISREQUIRED";
  // } else {
  //   if (data.pstblkey.length > 25) errors.pstblkey = 'INVALIDVALUELENGTH&25';
  // }

  if (Validator.isEmpty(data.pstbldsc)) {
    errors.pstbldsc = "FIELDISREQUIRED";
  } else {
    if (data.pstbldsc.length > 255) errors.pstbldsc = 'INVALIDVALUELENGTH&255';
  }

  // if (Validator.isEmpty(data.pstbldsc)) {
  //   errors.pstbldsc = "GENDESCISREQUIRED";
  // } else {
  if (data.pstbllds.length > 255) errors.pstbllds = 'INVALIDVALUELENGTH&255';
  // }
  // if (data.pstblpnt.length > 25) errors.pstblpnt = 'INVALIDVALUELENGTH&25';


  return {
    errors,
    isValid: isEmpty(errors)
  }
};

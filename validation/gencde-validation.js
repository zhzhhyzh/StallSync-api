const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateGencdeInput(data, type) {
  let errors = {};
  data.prgtycde = !isEmpty(data.prgtycde) ? data.prgtycde : '';
  data.prgecode = !isEmpty(data.prgecode) ? data.prgecode : '';
  data.prgedesc = !isEmpty(data.prgedesc) ? data.prgedesc : '';
  data.prgeldes = !isEmpty(data.prgeldes) ? data.prgeldes : '';

  if (Validator.isEmpty(data.prgtycde)) {
    errors.prgtycde = "GENTYPCDISREQUIRED";
  }else {
    if (data.prgtycde.length > 10) errors.prgtycde = 'INVALIDVALUELENGTH&10';
  }

  if (Validator.isEmpty(data.prgecode)) {
    errors.prgecode = "GENCODEISREQUIRED";
  } 
  //else {
  //   if (data.prgecode.length > 10) errors.prgecode = 'INVALIDVALUELENGTH&10';
  // }
  
  if (Validator.isEmpty(data.prgedesc)) {
    errors.prgedesc = "GENDESCISREQUIRED";
  } else {
    if (data.prgedesc.length > 50) errors.prgedesc = 'INVALIDVALUELENGTH&50';
  }

  if (data.prgeldes.length > 50) errors.prgeldes = 'INVALIDVALUELENGTH&50';


  return {
    errors,
    isValid: isEmpty(errors)
  }
};

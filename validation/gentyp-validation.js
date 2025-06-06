const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateGentypInput(data, type) {
  let errors = {};
  data.prgtycde = !isEmpty(data.prgtycde) ? data.prgtycde : '';
  data.prgtydsc = !isEmpty(data.prgtydsc) ? data.prgtydsc : '';
  data.psgtylds = !isEmpty(data.psgtylds) ? data.psgtylds : '';

  if (Validator.isEmpty(data.prgtycde)) {
    errors.prgtycde = "GENTYPCDISREQUIRED";
  } else {
    if (data.prgtycde.length > 10) errors.prgtycde = 'INVALIDVALUELENGTH&10';
  }

  if (Validator.isEmpty(data.prgtydsc)) {
    errors.prgtydsc = "GENTYDESISREQUIRED";
  } else {
    if (data.prgtydsc.length > 50) errors.prgtydsc = 'INVALIDVALUELENGTH&50';
  }

 
    if (data.psgtylds.length > 50) errors.psgtylds = 'INVALIDVALUELENGTH&50';
  

  return {
    errors,
    isValid: isEmpty(errors)
  }
};

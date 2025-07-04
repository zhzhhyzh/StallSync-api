const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePsordrvwInput(data, type) {
    let errors = {};
    data.psorduid = !isEmpty(data.psorduid) ? data.psorduid : "";
    data.psrvwimg = !isEmpty(data.psrvwimg) ? data.psrvwimg : "";
    data.psrvwvid = !isEmpty(data.psrvwvid) ? data.psrvwvid : "";
    data.psrvwrtg = !isEmpty(data.psrvwrtg) ? data.psrvwrtg : 5;
    data.psrvwdsc = !isEmpty(data.psrvwdsc) ? data.psrvwdsc : "";

    if (Validator.isEmpty(data.psorduid)) {
        errors.psorduid = "FIELDISREQUIRED";
    }
    else if (!Validator.isEmpty(data.psorduid) && data.psorduid.length > 25) {
        errors.psorduid = "INVALIDVALUELENGTH&25";
    }

    if (Validator.isEmpty(data.psrvwdsc)) {
        errors.psrvwdsc = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty(data.psrvwdsc) && data.psrvwdsc.length > 255) {
        errors.psrvwdsc = "INVALIDVALUELENGTH&255";
    }


    if (!Validator.isEmpty(data.psrvwimg) && data.psrvwimg.length > 255) {
        errors.psrvwimg = "INVALIDVALUELENGTH&255";
    }


    if (!Validator.isEmpty(data.psrvwvid) && data.psrvwvid.length > 255) {
        errors.psrvwvid = "INVALIDVALUELENGTH&255";
    }

    if (!isEmpty(data.psrvwrtg)) {
        if (data.psrvwrtg < 1 || data.psrvwrtg > 5) {
            errors.psrvwrtg = "INVALIDDATAVALUE";
        }
    } 

    return {
        errors,
        isValid: isEmpty(errors)
    };
}
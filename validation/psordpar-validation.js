const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePsordparInput(data, type) {
    let errors = {};
    data.psmbruid = !isEmpty(data.psmbruid) ? data.psmbruid : "";
    data.psordrap = !isEmpty(data.psordrap) ? data.psordrap : "N";
    data.psordpap = !isEmpty(data.psordpap) ? data.psordpap : "N";
    data.psordpre = !isEmpty(data.psordpre) ? data.psordpre : "";
    data.psordphn = !isEmpty(data.psordphn) ? data.psordphn : "";
    data.psrwduid = !isEmpty(data.psrwduid) ? data.psrwduid : "";
    data.psmrcuid = !isEmpty(data.psmrcuid) ? data.psmrcuid : "";

    if (Validator.isEmpty(data.psordrap)) {
        errors.psordrap = "FIELDISREQUIRED";
    } else {
        if (data.psordrap.length > 10) errors.psordrap = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psordpap)) {
        errors.psordpap = "FIELDISREQUIRED";
    } else {
        if (data.psordpap.length > 10) errors.psordpap = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psordpre) && Validator.isEmpty(data.psmbruid)) {
        errors.psordpre = "FIELDISREQUIRED";
    } else {
        if (data.psordpre.length > 10) errors.psordpre = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psordphn) && Validator.isEmpty(data.psmbruid)) {
        errors.psordphn = "FIELDISREQUIRED";
    } else {
        if (data.psordphn.length > 25) errors.psordphn = "INVALIDVALUELENGTH&25";
    }

    if (data.psordrap == 'Y' && data.psrwduid == '') {
        errors.psrwduid = "FIELDISREQUIRED";

    } else {
        if (data.psrwduid.length > 25) errors.psrwduid = "INVALIDVALUELENGTH&25";
    }

    if (Validator.isEmpty(data.psmrcuid)) {
        errors.psmrcuid = "FIELDISREQUIRED";
    } else {
        if (data.psmrcuid.length > 10) errors.psmrcuid = "INVALIDVALUELENGTH&10";
    }




    return {
        errors,
        isValid: isEmpty(errors),
    };
};

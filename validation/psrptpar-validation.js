const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePsrptparInput(data, type) {
    let errors = {};
    data.psrptuid = !isEmpty(data.psrptuid) ? data.psrptuid : "";
    data.psrptnme = !isEmpty(data.psrptnme) ? data.psrptnme : "";
    data.psrpttyp = !isEmpty(data.psrpttyp) ? data.psrpttyp : "";
    data.psmrcuid = !isEmpty(data.psmrcuid) ? data.psmrcuid : "";
    data.psrptpat = !isEmpty(data.psrptpat) ? data.psrptpat : "";
    data.psrptdat = !isEmpty(data.psrptdat) ? data.psrptdat : new Date();
    data.psrptifc = !isEmpty(data.psrptifc) ? data.psrptifc : "";
    //data.psrptfcp = !isEmpty(data.psrptfcp) ? data.psrptfcp : "";

    if (Validator.isEmpty(data.psrptuid)) {
        errors.psrptuid = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty(data.psrptuid) && data.psrptuid.length > 50) {
        errors.psrptuid = "INVALIDVALUELENGTH&50";
    }

    if (Validator.isEmpty(data.psrptnme)) {
        errors.psrptnme = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty(data.psrptnme) && data.psrptnme.length > 255) {
        errors.psrptnme = "INVALIDVALUELENGTH&255";
    }

    if (Validator.isEmpty(data.psrpttyp)) {
        errors.psrpttyp = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty(data.psrpttyp) && data.psrpttyp.length > 255) {
        errors.psrpttyp = "INVALIDVALUELENGTH&255";
    }

    if (Validator.isEmpty(data.psmrcuid)) {
        errors.psmrcuid = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty(data.psmrcuid) && data.psmrcuid.length > 25) {
        errors.psmrcuid = "INVALIDVALUELENGTH&25";
    }

    if (Validator.isEmpty(data.psrptpat)) {
        errors.psrptpat = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty(data.psrptpat) && data.psrptpat.length > 255) {
        errors.psrptpat = "INVALIDVALUELENGTH&255";
    }

    if (Validator.isEmpty(data.psrptdat)) {
        errors.psrptdat = "FIELDISREQUIRED";
    }

    if (Validator.isEmpty(data.psrptifc)) {
        errors.psrptifc = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty(data.psrptifc) && data.psrptifc.length > 255) {
        errors.psrptifc = "INVALIDVALUELENGTH&255";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
}
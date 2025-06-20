const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePstrxparInput(data, type) {
    let errors = {};
    data.pstrcuid = !isEmpty(data.pstrcuid) ? data.pstrcuid : "";
    data.psorduid = !isEmpty(data.psorduid) ? data.psorduid : "";
    data.pstrxdat = !isEmpty(data.pstrxdat) ? data.pstrxdat : "";
    data.pstrxamt = !isEmpty(data.pstrxamt) ? data.pstrxamt : 0;
    data.pstrxsts = !isEmpty(data.pstrxsts) ? data.pstrxsts : "";
    data.pstrxcrc = !isEmpty(data.pstrxcrc) ? data.pstrxcrc : "";
    data.pstrxmtd = !isEmpty(data.pstrxmtd) ? data.pstrxmtd : "";
    data.pstrxba1 = !isEmpty(data.pstrxba1) ? data.pstrxba1 : "";
    data.pstrxba2 = !isEmpty(data.pstrxba2) ? data.pstrxba2 : "";
    data.pstrxbpo = !isEmpty(data.pstrxbpo) ? data.pstrxbpo : "";
    data.pstrxbci = !isEmpty(data.pstrxbci) ? data.pstrxbci : "";
    data.pstrxbst = !isEmpty(data.pstrxbst) ? data.pstrxbst : "";
    data.pstrxbstc = !isEmpty(data.pstrxbstc) ? data.pstrxbstc : "";

    if (Validator.isEmpty(data.pstrcuid)) {
        errors.pstrcuid = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty(data.pstrcuid) && data.pstrcuid.length > 50) {
        errors.pstrcuid = "INVALIDVALUELENGTH&50";
    }

    if (Validator.isEmpty(data.psorduid)) {
        errors.psorduid = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty(data.psorduid) && data.psorduid.length > 25) {
        errors.psorduid = "INVALIDVALUELENGTH&25";
    }

    if (Validator.isEmpty(data.pstrxdat)) {
        errors.pstrxdat = "FIELDISREQUIRED";
    }

    if (Validator.isEmpty(data.pstrxamt)) {
        errors.pstrxamt = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty(data.pstrxamt) && isNaN(data.pstrxamt)) {
        errors.pstrxamt = "INVALIDDATAVALUE";
    } else if (!Validator.isEmpty(data.pstrxamt) && data.pstrxamt < 0) {
        errors.pstrxamt = "INVALIDDATAVALUE";
    }

    if (Validator.isEmpty(data.pstrxsts)) {
        errors.pstrxsts = "FIELDISREQUIRED";
    } 

    if (Validator.isEmpty(data.pstrxcrc)) {
        errors.pstrxcrc = "FIELDISREQUIRED";
    }

    if (Validator.isEmpty(data.pstrxmtd)) {
        errors.pstrxmtd = "FIELDISREQUIRED";
    }

    if (!isEmpty(data.pstrxba1) && data.pstrxba1.length > 255) {
        errors.pstrxba1 = "INVALIDVALUELENGTH&255";
    }

    if (!isEmpty(data.pstrxba2) && data.pstrxba2.length > 255) {
        errors.pstrxba2 = "INVALIDVALUELENGTH&255";
    }

    if (!isEmpty(data.pstrxbpo) && data.pstrxbpo.length > 25) {
        errors.pstrxbpo = "INVALIDVALUELENGTH&25";
    }

    if (!isEmpty(data.pstrxbci) && data.pstrxbci.length > 25) {
        errors.pstrxbci = "INVALIDVALUELENGTH&25";
    }

    if (!isEmpty(data.pstrxbst) && data.pstrxbst.length > 25) {
        errors.pstrxbst = "INVALIDVALUELENGTH&25";
    }

    if (!isEmpty(data.pstrxstr) && data.pstrxbstc.length > 25) {
        errors.pstrxbstc = "INVALIDVALUELENGTH&25";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
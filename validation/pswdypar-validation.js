const Validator = require("validator");
const isEmpty = require("./is-empty");
const _ = require("lodash");

module.exports = function validatePswdypar(data, type) {
    let errors = {};
    data.pswdycde = !isEmpty(data.pswdycde) ? data.pswdycde : "";
    data.pswdydsc = !isEmpty(data.pswdydsc) ? data.pswdydsc : "";
    data.pswdylds = !isEmpty(data.pswdylds) ? data.pswdylds : "";
    data.pswdyind = !isEmpty(data.pswdyind) ? data.pswdyind : "Y";


    if (Validator.isEmpty(data.pswdycde) && type == 'A') {
        errors.pswdycde = "FIELDISREQUIRED";
    } else {
        if (data.pswdycde.length > 10) errors.pswdycde = "INVALIDVALUELENGTH&10";
    }



    if (Validator.isEmpty(data.pswdydsc)) {
        errors.pswdydsc = "FIELDISREQUIRED";
    } else {
        if (data.pswdydsc.length > 255) errors.pswdydsc = "INVALIDVALUELENGTH&255";
    }

    if (data.pswdylds.length > 255) errors.pswdylds = "INVALIDVALUELENGTH&255";



    if (Validator.isEmpty(data.pswdyind)) {
        errors.pswdyind = "FIELDISREQUIRED";
    } else {
        if (data.pswdyind.length > 10) errors.pswdyind = "INVALIDVALUELENGTH&10";
    }





    return {
        errors,
        isValid: isEmpty(errors),
    };
};

const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePsprddtlInput(data, type) {
    let errors = {};
    // data.psprduid = !isEmpty(data.psprduid) ? data.psprduid : "";
    data.psprdapn = !isEmpty(data.psprdapn) ? data.psprdapn : "";
    data.psprdaty = !isEmpty(data.psprdaty) ? data.psprdaty : "";
    data.psprdmnd = !isEmpty(data.psprdmnd) ? data.psprdmnd : "N";

    data.psprdpri = !isEmpty(data.psprdpri) ? data.psprdpri : 0;





    // if (type == "A" && Validator.isEmpty(data.psprduid)) {
    //     errors.psprduid = "FIELDISREQUIRED";
    // } else if (
    //     type == "A" &&
    //     !Validator.isEmpty(data.psprduid) &&
    //     data.psprduid.length > 25
    // )
    //     errors.psprduid = "INVALIDVALUELENGTH&25";

    if (Validator.isEmpty(data.psprdapn)) {
        errors.psprdapn = "FIELDISREQUIRED";
    } else {
        if (data.psprdapn.length > 255) errors.psprdapn = "INVALIDVALUELENGTH&255";
    }






    if (Validator.isEmpty(data.psprdaty)) {
        errors.psprdaty = "FIELDISREQUIRED";
    } else {
        if (data.psprdaty.length > 10) errors.psprdaty = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psprdmnd)) {
        errors.psprdmnd = "FIELDISREQUIRED";
    } else {
        if (data.psprdmnd.length > 10) errors.psprdmnd = "INVALIDVALUELENGTH&10";
    }



    if (!Validator.isEmpty("" + data.psprdpri) && isNaN(parseInt(data.psprdpri))) {
        errors.psprdpri = "INVALIDDATAVALUE";

    } else if (data.psprdpri > 999999999) {
        errors.psprdpri = "INVALIDVALUELENGTH&999999999";

    }
    else if (data.psprdpri < 0) {
        errors.psprdpri = "INVALIDVALUELENGTHMIN&0"
    }



    return {
        errors,
        isValid: isEmpty(errors),
    };
};

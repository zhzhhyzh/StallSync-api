const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePsmbrcrtInput(data, type) {
    let errors = {};
    data.psmbrcar = !isEmpty(data.psmbrcar) ? data.psmbrcar : "";
    // data.psitmcno = !isEmpty(data.psitmcno) ? data.psitmcno : "";
    data.psmrcuid = !isEmpty(data.psmrcuid) ? data.psmrcuid : "";
    data.psprduid = !isEmpty(data.psprduid) ? data.psprduid : "";
    data.psitmqty = !isEmpty(data.psitmqty) ? data.psitmqty : 0;
    data.psitmdsc = !isEmpty(data.psitmdsc) ? data.psitmdsc : "";
    data.psitmunt = !isEmpty(data.psitmunt) ? data.psitmunt : 0;
    data.psitmsbt = !isEmpty(data.psitmsbt) ? data.psitmsbt : 0;
    data.psitmrmk = !isEmpty(data.psitmrmk) ? data.psitmrmk : "";   


    if (Validator.isEmpty(data.psmbrcar) && type == "A") {
        errors.psmbrcar = "FIELDISREQUIRED";
    } else if (
        type == "A" &&
        !Validator.isEmpty(data.psmbrcar) &&
        data.psmbrcar.length > 50
    ) {
        errors.psmbrcar = "INVALIDVALUELENGTH&50";
    }

    // if (Validator.isEmpty(data.psitmcno) && type == "A") {
    //     errors.psitmcno = "FIELDISREQUIRED";
    // } else if (
    //     type == "A" &&
    //     !Validator.isEmpty(data.psitmcno) &&
    //     data.psitmcno > 50
    // ) {
    //     errors.psitmcno = "INVALIDDATAVALUE";
    // }

    if (Validator.isEmpty(data.psmrcuid)) {
        errors.psmrcuid = "FIELDISREQUIRED";
    } else if (
        !Validator.isEmpty(data.psmrcuid) &&
        data.psmrcuid.length > 25
    ) {
        errors.psmrcuid = "INVALIDVALUELENGTH&25";
    }

    if (Validator.isEmpty(data.psprduid)) {
        errors.psprduid = "FIELDISREQUIRED";
    } else if (
        !Validator.isEmpty(data.psprduid) &&
        data.psprduid.length > 25
    ) {
        errors.psprduid = "INVALIDVALUELENGTH&25";
    }

    if (Validator.isEmpty(data.psitmqty)) {
        errors.psitmqty = "FIELDISREQUIRED";
    } else if (
        !Validator.isEmpty(data.psitmqty) &&
        (data.psitmqty < 1 || data.psitmqty > 999)
    ) {
        errors.psitmqty = "INVALIDDATAVALUE";
    }

    if (Validator.isEmpty(data.psitmdsc)) {
        errors.psitmdsc = "FIELDISREQUIRED";
    } else if (data.psitmdsc.length > 255) {
        errors.psitmdsc = "INVALIDVALUELENGTH&255";
    }

    if (Validator.isEmpty(data.psitmunt)) {
        errors.psitmunt = "FIELDISREQUIRED";
    } else if (
        !Validator.isEmpty(data.psitmunt) &&
        (isNaN(data.psitmunt) || data.psitmunt < 0 || data.psitmunt > 999999999.99)
    ) {
        errors.psitmunt = "INVALIDDATAVALUE";
    }

    if (Validator.isEmpty(data.psitmsbt)) {
        errors.psitmsbt = "FIELDISREQUIRED";
    } else if (
        !Validator.isEmpty(data.psitmsbt) &&
        (isNaN(data.psitmsbt) || data.psitmsbt < 0 || data.psitmsbt > 999999999.99)
    ) {
        errors.psitmsbt = "INVALIDDATAVALUE";
    }

    if (data.psitmrmk.length > 255) {
        errors.psitmrmk = "INVALIDVALUELENGTH&255";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
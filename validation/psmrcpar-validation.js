const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePsmrcparInput(data, type) {
    let errors = {};
    data.psmrcuid = !isEmpty(data.psmrcuid) ? data.psmrcuid : "";
    data.psmrcnme = !isEmpty(data.psmrcnme) ? data.psmrcnme : "";
    data.psmrcdsc = !isEmpty(data.psmrcdsc) ? data.psmrcdsc : "";
    data.psmrclds = !isEmpty(data.psmrclds) ? data.psmrclds : "";
    data.psmrcown = !isEmpty(data.psmrcown) ? data.psmrcown : "";
    data.psmrcsts = !isEmpty(data.psmrcsts) ? data.psmrcsts : "Y";
    // data.psmrcsdt = !isEmpty(data.psmrcsdt) ? data.psmrcsdt : new Date();
    data.psmrcjdt = !isEmpty(data.psmrcjdt) ? data.psmrcjdt : "";
    data.psmrcssm = !isEmpty(data.psmrcssm) ? data.psmrcssm : "";
    data.psmrcssc = !isEmpty(data.psmrcssc) ? data.psmrcssc : "";
    data.psmrcbnk = !isEmpty(data.psmrcbnk) ? data.psmrcbnk : "";
    data.psmrcacc = !isEmpty(data.psmrcacc) ? data.psmrcacc : "";
    data.psmrcbnm = !isEmpty(data.psmrcbnm) ? data.psmrcbnm : "";
    data.psmrcsfi = !isEmpty(data.psmrcsfi) ? data.psmrcsfi : "";
    data.psmrcppi = !isEmpty(data.psmrcppi) ? data.psmrcppi : "";
    // data.psmrcrtg = !isEmpty(data.psmrcrtg) ? data.psmrcrtg : "";
    data.psmrcrmk = !isEmpty(data.psmrcrmk) ? data.psmrcrmk : "";


    if (type == "A" && Validator.isEmpty(data.psmrcuid)) {
        errors.psmrcuid = "FIELDISREQUIRED";
    } else if (
        type == "A" &&
        !Validator.isEmpty(data.psmrcuid) &&
        data.psmrcuid.length > 25
    )
        errors.psmrcuid = "INVALIDVALUELENGTH&25";

    if (Validator.isEmpty(data.psmrcnme)) {
        errors.psmrcnme = "FIELDISREQUIRED";
    } else {
        if (data.psmrcnme.length > 255) errors.psmrcnme = "INVALIDVALUELENGTH&255";
    }

    if (Validator.isEmpty(data.psmrcdsc)) {
        errors.psmrcdsc = "FIELDISREQUIRED";
    } else {
        if (data.psmrcdsc.length > 255) errors.psmrcdsc = "INVALIDVALUELENGTH&255";
    }


    if (data.psmrclds.length > 255) errors.psmrclds = "INVALIDVALUELENGTH&255";


    if (Validator.isEmpty(data.psmrcjdt) && type == 'C') {
        errors.psmrcjdt = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty('' + data.psmrcjdt)) {
        let newDate = new Date(data.psmrcjdt);

        if (isNaN(newDate.getTime())) {
            errors.psmrcjdt = "INVALIDDATAVALUE";
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (newDate > today) {
                errors.psmrcjdt = "FUTUREDATE";
            }
        }
    }

    // if (Validator.isEmpty(data.psmrcown) ) {
    //     errors.psmrcown = "FIELDISREQUIRED";
    // } else {
        if (data.psmrcown.length > 25) errors.psmrcown = "INVALIDVALUELENGTH&25";

    // }

    if (Validator.isEmpty(data.psmrcssm)) {
        errors.psmrcssm = "FIELDISREQUIRED";
    } else {
        if (data.psmrcssm.length > 255) errors.psmrcssm = "INVALIDVALUELENGTH&255";
    }

    if (Validator.isEmpty(data.psmrcssc)) {
        errors.psmrcssc = "FIELDISREQUIRED";
    } else {
        if (data.psmrcssc.length > 255) errors.psmrcssc = "INVALIDVALUELENGTH&255";
    }

    if (Validator.isEmpty(data.psmrcsts)) {
        errors.psmrcsts = "FIELDISREQUIRED";
    } else {
        if (data.psmrcsts.length > 10) errors.psmrcsts = "INVALIDVALUELENGTH&10";
    }



    if (Validator.isEmpty(data.psmrcbnk)) {
        errors.psmrcbnk = "FIELDISREQUIRED";
    } else {
        if (data.psmrcbnk.length > 10) errors.psmrcbnk = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psmrcacc)) {
        errors.psmrcacc = "FIELDISREQUIRED";
    } else {
        if (data.psmrcacc.length > 25) errors.psmrcacc = "INVALIDVALUELENGTH&25";
    }

    if (Validator.isEmpty(data.psmrcbnm)) {
        errors.psmrcbnm = "FIELDISREQUIRED";
    } else {
        if (data.psmrcbnm.length > 255) errors.psmrcbnm = "INVALIDVALUELENGTH&255";
    }

    if (data.psmrcsfi.length > 255) errors.psmrcsfi = "INVALIDVALUELENGTH&255";
    if (data.psmrcppi.length > 255) errors.psmrcppi = "INVALIDVALUELENGTH&255";



    // if (!Validator.isEmpty("" + data.psmrcrtg) && isNaN(parseInt(data.psmrcrtg))) {
    //     errors.psmrcrtg = "INVALIDDATAVALUE";

    // } else if (data.psmrcrtg > 5) {
    //     errors.psmrcrtg = "INVALIDVALUELENGTH&5";

    // }
    // else if (data.psmrcrtg < 0) {
    //     errors.psmrcrtg = "INVALIDVALUELENGTHMIN&0"
    // }

    return {
        errors,
        isValid: isEmpty(errors),
    };
};

const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePsmbrprfInput(data, type) {
    let errors = {};
    // data.psmbruid = !isEmpty(data.psmbruid) ? data.psmbruid : "";
    data.psmbrnam = !isEmpty(data.psmbrnam) ? data.psmbrnam : "";
    data.psmbreml = !isEmpty(data.psmbreml) ? data.psmbreml : "";
    data.psmbrdob = !isEmpty(data.psmbrdob) ? data.psmbrdob : "";
    // data.psmbrpts = !isEmpty(data.psmbrpts) ? data.psmbrpts : 500;
    // data.psmbracs = !isEmpty(data.psmbracs) ? data.psmbracs : 0;
    data.psmbrtyp = !isEmpty(data.psmbrtyp) ? data.psmbrtyp : "";
    // data.psmbrexp = !isEmpty(data.psmbrexp) ? data.psmbrexp : "";
    data.psmbrjdt = !isEmpty(data.psmbrjdt) ? data.psmbrjdt : new Date();
    // data.psmbrcar = !isEmpty(data.psmbrcar) ? data.psmbrcar : "";
    data.psusrnme = !isEmpty(data.psusrnme) ? data.psusrnme : "";
    data.psmbrpre = !isEmpty(data.psmbrpre) ? data.psmbrpre : "";
    data.psmbrphn = !isEmpty(data.psmbrphn) ? data.psmbrphn : "";

    // if (type == "A" && Validator.isEmpty(data.psmbruid)) {
    //     errors.psmbruid = "FIELDISREQUIRED";
    // } else if (
    //     type == "A" &&
    //     !Validator.isEmpty(data.psmbruid) &&
    //     data.psmbruid.length > 25
    // )
    //     errors.psmbruid = "INVALIDVALUELENGTH&25";

    if (Validator.isEmpty(data.psmbrnam)) {
        errors.psmbrnam = "FIELDISREQUIRED";
    } else {
        if (data.psmbrnam.length > 255) errors.psmbrnam = "INVALIDVALUELENGTH&255";
    }

    if (Validator.isEmpty(data.psmbreml)) {
        errors.psmbreml = "FIELDISREQUIRED";
    } else {
        if (data.psmbreml.length > 255) errors.psmbreml = "INVALIDVALUELENGTH&255";
    }


    if (Validator.isEmpty(data.psmbrdob)) {
        errors.psmbrdob = "FIELDISREQUIRED";
    } else if (!Validator.isEmpty('' + data.psmbrdob)) {
        let newDate = new Date(data.psmbrdob);

        if (isNaN(newDate.getTime())) {
            errors.psmbrdob = "INVALIDDATAVALUE";
        } else {
            const today = new Date();
            today.setHours(23,59,59,59);
            if (newDate > today) {
                errors.psmbrdob = "FUTUREDATE";
            }
        }
    }

    // if (data.psmbrpts < 0) {
    //     errors.psmbrpts = "INVALIDDATAVALUE";
    // } else if (data.psmbrpts > 999999999999.99) {
    //     errors.psmbrpts = "INVALIDVALUELENGTH&15,2";
    // }

    // if (data.psmbracs < 0) {
    //     errors.psmbracs = "INVALIDDATAVALUE&ACCTS";
    // } else if (data.psmbracs > 999999999999.99) {
    //     errors.psmbracs = "INVALIDVALUELENGTH&15,2";
    // }

    if (Validator.isEmpty(data.psmbrtyp) && type == "N") {
        errors.psmbrtyp = "FIELDISREQUIRED";
    } else {
        if (data.psmbrtyp.length > 10) errors.psmbrtyp = "INVALIDVALUELENGTH&10";
    }

    // if (Validator.isEmpty(data.psmbrexp)) {
    //     errors.psmbrexp = "FIELDISREQUIRED";
    // }

    if (!Validator.isEmpty('' + data.psmbrjdt)) {
        let newDate = new Date(data.psmbrjdt);

        if (isNaN(newDate.getTime())) {
            errors.psmbrjdt = "INVALIDDATAVALUE";
        } else {
            const today = new Date();
            today.setHours(23,59,59,59);
            if (newDate > today) {
                errors.psmbrjdt = "FUTUREDATE";
            }
        }
    }

    // if (Validator.isEmpty(data.psmbrcar)) {
    //     errors.psmbrcar = "FIELDISREQUIRED";
    // } else {
    //     if (data.psmbrcar.length > 50) errors.psmbrcar = "INVALIDVALUELENGTH&50";
    // }

    if (Validator.isEmpty(data.psusrnme) && type == "N") {
        errors.psusrnme = "FIELDISREQUIRED";
    } else {
        if (data.psusrnme.length > 255) errors.psusrnme = "INVALIDVALUELENGTH&255";
    }

    if (Validator.isEmpty(data.psmbrpre) && type == "N") {
        errors.psmbrpre = "FIELDISREQUIRED";
    } else {
        if (data.psmbrpre.length > 10) errors.psmbrpre = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psmbrphn)) {
        errors.psmbrphn = "FIELDISREQUIRED";
    } else {
        if (data.psmbrphn.length > 25) errors.psmbrphn = "INVALIDVALUELENGTH&25";
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
};

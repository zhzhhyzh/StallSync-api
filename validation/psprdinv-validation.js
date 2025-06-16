const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePsprdparInput(data, type) {
    let errors = {};
    data.psprduid = !isEmpty(data.psprduid) ? data.psprduid : "";
    data.psinvsty = !isEmpty(data.psinvsty) ? data.psinvsty : "";

    data.psinvqty = !isEmpty(data.psinvqty) ? data.psinvqty : 0;
    data.psinvsdt = !isEmpty(data.psinvsdt) ? data.psinvsdt : '';



    if (type == "A" && Validator.isEmpty(data.psprduid)) {
        errors.psprduid = "FIELDISREQUIRED";
    } else if (
        type == "A" &&
        !Validator.isEmpty(data.psprduid) &&
        data.psprduid.length > 25
    )
        errors.psprduid = "INVALIDVALUELENGTH&25";

    if (Validator.isEmpty(data.psinvsty)) {
        errors.psinvsty = "FIELDISREQUIRED";
    } else {
        if (data.psinvsty.length > 255) errors.psinvsty = "INVALIDVALUELENGTH&255";
    }

    if (!Validator.isEmpty('' + data.psinvsdt)) {
        let newDate = new Date(data.psinvsdt);
        if (!newDate instanceof Date && isNaN(newDate)) {
            errors.psinvsdt = "INVALIDDATAVALUE";
        } else {
            let today = new Date();
            today.setHours(0, 0, 0, 0);
            let notdvd = new Date(data.psinvsdt);
            if (notdvd < today) errors.psinvsdt = "PASTDATE";
        }
    }

    if (!Validator.isEmpty("" + data.psinvqty) && isNaN(parseInt(data.psinvqty))) {
        errors.psinvqty = "INVALIDDATAVALUE";

    } else if (data.psinvqty > 999999999) {
        errors.psinvqty = "INVALIDVALUELENGTH&999999999";

    }
    else if (data.psinvqty < 0) {
        errors.psinvqty = "INVALIDVALUELENGTHMIN&0"
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
};

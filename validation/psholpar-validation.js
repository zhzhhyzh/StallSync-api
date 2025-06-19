const Validator = require("validator");
const isEmpty = require("./is-empty");
const _ = require("lodash");

module.exports = function validatePsholpar(data, type) {
    let errors = {};
    // data.psholcde = !isEmpty(data.psholcde) ? data.psholcde : "";
    // data.psholday = !isEmpty(data.psholday) ? data.psholday : 1;
    data.psholdsc = !isEmpty(data.psholdsc) ? data.psholdsc : "";
    data.pshollds = !isEmpty(data.pshollds) ? data.pshollds : "";
    // data.psholsts = !isEmpty(data.psholsts) ? data.psholsts : "Y";
    data.psholtyp = !isEmpty(data.psholtyp) ? data.psholtyp : "F";
    // data.psholdat = !isEmpty(data.psholdat) ? data.psholdat : new Date();
    data.psholdat = !isEmpty(data.psholdat) ? data.psholdat : "";


    // if (Validator.isEmpty(data.psholcde) && type == 'A') {
    //     errors.psholcde = "FIELDISREQUIRED";
    // } else {
    //     if (data.psholcde.length > 10) errors.psholcde = "INVALIDVALUELENGTH&10";
    // }

    // if (!Validator.isEmpty("" + data.psholday) && isNaN(parseInt(data.psholday)))
    //     errors.psholday = "INVALIDDATAVALUE";
    // else if (data.psholday < 1) errors.psholday = "Sequence Must Greater than 0"


    if (Validator.isEmpty(data.psholdsc)) {
        errors.psholdsc = "FIELDISREQUIRED";
    } else {
        if (data.psholdsc.length > 255) errors.psholdsc = "INVALIDVALUELENGTH&255";
    }

    if (data.pshollds.length > 255) errors.pshollds = "INVALIDVALUELENGTH&255";

    if (Validator.isEmpty(data.psholtyp)) {
        errors.psholtyp = "FIELDISREQUIRED";
    } else {
        if (data.psholtyp.length > 10) errors.psholtyp = "INVALIDVALUELENGTH&10";
    }

    // if (Validator.isEmpty(data.psholsts)) {
    //     errors.psholsts = "FIELDISREQUIRED";
    // } else {
    //     if (data.psholsts.length > 10) errors.psholsts = "INVALIDVALUELENGTH&10";
    // }

    if (!Validator.isEmpty('' + data.psholdat)) {
        // Validate it is a valid date
        let newDate = new Date(data.psholdat);
        if (!(newDate instanceof Date) || isNaN(newDate)) {
            errors.psholdat = 'INVALIDDATAVALUE';
        }

        // else {
        //     // Validate it is not a future date
        //     let currentDate = new Date();
        //     if (newDate > currentDate) {
        //       errors.psholdat = 'FUTUREDATE';
        //     }
        //   }
    } else {
        errors.psholdat = "FIELDISREQUIRED";
    }




    return {
        errors,
        isValid: isEmpty(errors),
    };
};

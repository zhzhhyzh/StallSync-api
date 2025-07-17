const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePsrwdparInput(data, type) {
    let errors = {};
    data.psrwduid = !isEmpty(data.psrwduid) ? data.psrwduid : "";
    data.psrwdnme = !isEmpty(data.psrwdnme) ? data.psrwdnme : "";
    data.psrwddsc = !isEmpty(data.psrwddsc) ? data.psrwddsc : "";
    data.psrwdlds = !isEmpty(data.psrwdlds) ? data.psrwdlds : "";
    // data.psrwdsts = !isEmpty(data.psrwdsts) ? data.psrwdsts : "I";
    data.psrwdism = !isEmpty(data.psrwdism) ? data.psrwdism : "N";
    data.psrwdica = !isEmpty(data.psrwdica) ? data.psrwdica : "N";

    data.psrwdtyp = !isEmpty(data.psrwdtyp) ? data.psrwdtyp : "";
    data.psrwdfdt = !isEmpty(data.psrwdfdt) ? data.psrwdfdt : '';
    data.psrwdtdt = !isEmpty(data.psrwdtdt) ? data.psrwdtdt : '';
    data.psrwddva = !isEmpty(data.psrwddva) ? data.psrwddva : 0;
    data.psrwdcap = !isEmpty(data.psrwdcap) ? data.psrwdcap : 0;
    data.psrwdmin = !isEmpty(data.psrwdmin) ? data.psrwdmin : 0;
    data.psrwdaam = !isEmpty(data.psrwdaam) ? data.psrwdaam : "";

    //-----
    data.psrwdqty = !isEmpty(data.psrwdqty) ? data.psrwdqty : "";






    if (type == "A" && Validator.isEmpty(data.psrwduid)) {
        errors.psrwduid = "FIELDISREQUIRED";
    } else if (
        type == "A" &&
        !Validator.isEmpty(data.psrwduid) &&
        data.psrwduid.length > 10
    )
        errors.psrwduid = "INVALIDVALUELENGTH&10";

    if (Validator.isEmpty(data.psrwdnme)) {
        errors.psrwdnme = "FIELDISREQUIRED";
    } else {
        if (data.psrwdnme.length > 10) errors.psrwdnme = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psrwddsc)) {
        errors.psrwddsc = "FIELDISREQUIRED";
    } else {
        if (data.psrwddsc.length > 255) errors.psrwddsc = "INVALIDVALUELENGTH&255";
    }


    if (data.psrwdlds.length > 255) errors.psrwdlds = "INVALIDVALUELENGTH&255";

    if (Validator.isEmpty('' + data.psrwdfdt) && Validator.isEmpty('' + data.psrwdtdt)) {
        errors.psrwdfdt = "DATERANGEISREQUIRED";
        errors.psrwdtdt = "DATERANGEISREQUIRED";
    }
    if (!Validator.isEmpty('' + data.psrwdfdt)) {
        const fromDate = new Date(data.psrwdfdt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!(fromDate instanceof Date) || isNaN(fromDate.getTime())) {
            errors.psrwdfdt = "INVALIDDATAVALUE";
        } else if (fromDate < today && type == 'A') {
            errors.psrwdfdt = "PASTDATE";
        }
    }

    if (!Validator.isEmpty('' + data.psrwdtdt)) {
        const toDate = new Date(data.psrwdtdt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!(toDate instanceof Date) || isNaN(toDate.getTime())) {
            errors.psrwdtdt = "INVALIDDATAVALUE";
        } else if (toDate < today) {
            errors.psrwdtdt = "PASTDATE";
        }

        // Only validate range if both dates are valid
        if (!errors.psrwdfdt && !(new Date(data.psrwdfdt) <= toDate)) {
            errors.psrwdfdt = "INVALIDDATERANGE";
        }
    }

    if (Validator.isEmpty(data.psrwdtyp)) {
        errors.psrwdtyp = "FIELDISREQUIRED";
    } else {
        if (data.psrwdtyp.length > 10) errors.psrwdtyp = "INVALIDVALUELENGTH&10";
    }

    if (!Validator.isEmpty("" + data.psrwddva)) {
        const value = parseFloat(data.psrwddva);

        if (isNaN(value)) {
            errors.psrwddva = "INVALIDDATAVALUE";
        } else if (value <= 0) {
            errors.psrwddva = "INVALIDDATAVALUE";
        } else if (data.psrwdtyp === 'P') {
            // Percentage: must be decimal(5,4) and < 1.0
            if (value > 1.0) {
                errors.psrwddva = "INVALIDVALUELENGTH&1";
            }
        } else if (data.psrwdtyp === 'V') {
            // Value: must be decimal(10,2) and <= 999999999
            if (value > 999999999) {
                errors.psrwddva = "INVALIDVALUELENGTH&999999999";
            }
        }
    }


    if (Validator.isEmpty(data.psrwdism)) {
        errors.psrwdism = "FIELDISREQUIRED";
    } else {
        if (data.psrwdism.length > 10) errors.psrwdism = "INVALIDVALUELENGTH&10";
    }

    if (data.psrwdmin == 0 && data.psrwdism == 'Y') {
        errors.psrwdmin = "FIELDISREQUIRED";

    }
    if (!Validator.isEmpty("" + data.psrwdmin)) {
        const value = parseFloat(data.psrwdmin);

        if (isNaN(value)) {
            errors.psrwdmin = "INVALIDDATAVALUE";
        } else if (value > 999999999.99) {
            errors.psrwdmin = "INVALIDVALUELENGTH&999999999.99";
        } else if (value < 0) {
            errors.psrwdmin = "INVALIDDATAVALUE";
        }
    }


    if (Validator.isEmpty(data.psrwdica)) {
        errors.psrwdica = "FIELDISREQUIRED";
    } else {
        if (data.psrwdica.length > 10) errors.psrwdica = "INVALIDVALUELENGTH&10";
    }


    if (data.psrwdcap == 0 && data.psrwdica == 'Y') {
        errors.psrwdcap = "FIELDISREQUIRED";

    }
    if (!Validator.isEmpty("" + data.psrwdcap)) {
        const value = parseFloat(data.psrwdcap);

        if (isNaN(value)) {
            errors.psrwdcap = "INVALIDDATAVALUE";
        } else if (value > 999999999.99) {
            errors.psrwdcap = "INVALIDVALUELENGTH&999999999.99";
        } else if (value < 0) {
            errors.psrwdcap = "INVALIDDATAVALUE";
        }
    }

    if (Validator.isEmpty(data.psrwdaam)) {
        errors.psrwdaam = "FIELDISREQUIRED";
    } else {
        if (data.psrwdaam.length > 10) errors.psrwdaam = "INVALIDVALUELENGTH&10";
    }


    // if (Validator.isEmpty(data.psrwdsts)) {
    //     errors.psrwdsts = "FIELDISREQUIRED";
    // } else {
    //     if (data.psrwdsts.length > 10) errors.psrwdsts = "INVALIDVALUELENGTH&10";
    // }



    if (!Validator.isEmpty("" + data.psrwdqty)) {
        const value = parseInt(data.psrwdqty, 10);

        if (isNaN(value)) {
            errors.psrwdqty = "INVALIDDATAVALUE";
        } else if (!Number.isInteger(value)) {
            errors.psrwdqty = "INVALIDDATAVALUE";
        } else if (value > 999999999) {
            errors.psrwdqty = "INVALIDVALUELENGTH&999999999";
        } else if (value < 0) {
            errors.psrwdqty = "INVALIDDATAVALUE";
        }
    }




  
    return {
        errors,
        isValid: isEmpty(errors),
    };
};

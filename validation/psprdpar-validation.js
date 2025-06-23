const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePsprdparInput(data, type) {
    let errors = {};
    // data.psprduid = !isEmpty(data.psprduid) ? data.psprduid : "";
    data.psprdnme = !isEmpty(data.psprdnme) ? data.psprdnme : "";
    data.psprddsc = !isEmpty(data.psprddsc) ? data.psprddsc : "";
    data.psprdlds = !isEmpty(data.psprdlds) ? data.psprdlds : "";
    data.psprdsts = !isEmpty(data.psprdsts) ? data.psprdsts : "A";
    data.psprdfvg = !isEmpty(data.psprdfvg) ? data.psprdfvg : "N";
    data.psprdhal = !isEmpty(data.psprdhal) ? data.psprdhal : "N";
    data.psprdcid = !isEmpty(data.psprdcid) ? data.psprdcid : "N";
    data.psprdtak = !isEmpty(data.psprdtak) ? data.psprdtak : "N";
    data.psmrcuid = !isEmpty(data.psmrcuid) ? data.psmrcuid : "";
    data.psprdtyp = !isEmpty(data.psprdtyp) ? data.psprdtyp : "";
    data.psprdlsr = !isEmpty(data.psprdlsr) ? data.psprdlsr : 10;
    data.psprdstk = !isEmpty(data.psprdstk) ? data.psprdstk : 0;
    data.psprdpri = !isEmpty(data.psprdpri) ? data.psprdpri : 0;
    data.psprdtpr = !isEmpty(data.psprdtpr) ? data.psprdtpr : 0;
    // data.psprdddt = !isEmpty(data.psprdddt) ? data.psprdddt : '';
    // data.psprddva = !isEmpty(data.psprddva) ? data.psprddva : '';

    data.psprdcat = !isEmpty(data.psprdcat) ? data.psprdcat : "";
    // data.psprdsdt = !isEmpty(data.psprdsdt) ? data.psprdsdt : new Date();
    // data.psprdcrd = !isEmpty(data.psprdcrd) ? data.psprdcrd: new Date();

    data.psprdimg = !isEmpty(data.psprdimg) ? data.psprdimg : "";
    // data.psprdrtg = !isEmpty(data.psprdrtg) ? data.psprdrtg : "";




    // if (type == "A" && Validator.isEmpty(data.psprduid)) {
    //     errors.psprduid = "FIELDISREQUIRED";
    // } else if (
    //     type == "A" &&
    //     !Validator.isEmpty(data.psprduid) &&
    //     data.psprduid.length > 25
    // )
    //     errors.psprduid = "INVALIDVALUELENGTH&25";

    if (Validator.isEmpty(data.psprdnme)) {
        errors.psprdnme = "FIELDISREQUIRED";
    } else {
        if (data.psprdnme.length > 255) errors.psprdnme = "INVALIDVALUELENGTH&255";
    }

    if (Validator.isEmpty(data.psprddsc)) {
        errors.psprddsc = "FIELDISREQUIRED";
    } else {
        if (data.psprddsc.length > 255) errors.psprddsc = "INVALIDVALUELENGTH&255";
    }


    if (data.psprdlds.length > 255) errors.psprdlds = "INVALIDVALUELENGTH&255";


    // if (!Validator.isEmpty('' + data.psprdddt)) {
    //     let newDate = new Date(data.psprdddt);
    //     if (!newDate instanceof Date && isNaN(newDate)) {
    //         errors.psprdddt = "INVALIDDATAVALUE";
    //     } else {
    //         let today = new Date();
    //         today.setHours(0, 0, 0, 0);
    //         let notdvd = new Date(data.psprdddt);
    //         if (notdvd < today) errors.psprdddt = "PASTDATE";
    //     }
    // }



    if (Validator.isEmpty(data.psprdsts)) {
        errors.psprdsts = "FIELDISREQUIRED";
    } else {
        if (data.psprdsts.length > 10) errors.psprdsts = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psprdfvg)) {
        errors.psprdfvg = "FIELDISREQUIRED";
    } else {
        if (data.psprdfvg.length > 10) errors.psprdfvg = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psprdcid)) {
        errors.psprdcid = "FIELDISREQUIRED";
    } else {
        if (data.psprdcid.length > 10) errors.psprdcid = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psprdtak)) {
        errors.psprdtak = "FIELDISREQUIRED";
    } else {
        if (data.psprdtak.length > 1) errors.psprdtak = "INVALIDVALUELENGTH&1";
    }


    if (Validator.isEmpty(data.psprdhal)) {
        errors.psprdhal = "FIELDISREQUIRED";
    } else {
        if (data.psprdhal.length > 10) errors.psprdhal = "INVALIDVALUELENGTH&10";
    }



    if (Validator.isEmpty(data.psprdcat)) {
        errors.psprdcat = "FIELDISREQUIRED";
    } else {
        if (data.psprdcat.length > 10) errors.psprdcat = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psprdtyp)) {
        errors.psprdtyp = "FIELDISREQUIRED";
    } else {
        if (data.psprdtyp.length > 10) errors.psprdtyp = "INVALIDVALUELENGTH&10";
    }

    if (Validator.isEmpty(data.psmrcuid)) {
        errors.psmrcuid = "FIELDISREQUIRED";
    } else {
        if (data.psmrcuid.length > 25) errors.psmrcuid = "INVALIDVALUELENGTH&25";
    }


    if (data.psprdimg.length > 255) errors.psprdimg = "INVALIDVALUELENGTH&255";

    if (!Validator.isEmpty("" + data.psprdlsr) && isNaN(parseInt(data.psprdlsr))) {
        errors.psprdlsr = "INVALIDDATAVALUE";

    } else if (data.psprdlsr > 999999999) {
        errors.psprdlsr = "INVALIDVALUELENGTH&999999999";

    }
    else if (data.psprdlsr < 0) {
        errors.psprdlsr = "INVALIDVALUELENGTHMIN&0"
    }

    if (!Validator.isEmpty("" + data.psprdstk) && isNaN(parseInt(data.psprdstk))) {
        errors.psprdstk = "INVALIDDATAVALUE";

    } else if (data.psprdstk > 999999999) {
        errors.psprdstk = "INVALIDVALUELENGTH&999999999";

    }
    else if (data.psprdstk < 0) {
        errors.psprdstk = "INVALIDVALUELENGTHMIN&0"
    }

    if (!Validator.isEmpty("" + data.psprdpri)) {
        const value = parseFloat(data.psprdpri);

        if (isNaN(value)) {
            errors.psprdpri = "INVALIDDATAVALUE";
        } else if (value > 999999999.99) {
            errors.psprdpri = "INVALIDVALUELENGTH&999999999.99";
        } else if (value < 0) {
            errors.psprdpri = "INVALIDVALUELENGTHMIN&0";
        }
    }


    if (!Validator.isEmpty("" + data.psprdtpr)) {
        const value = parseFloat(data.psprdtpr);

        if (isNaN(value)) {
            errors.psprdtpr = "INVALIDDATAVALUE";
        } else if (value > 100) {
            errors.psprdtpr = "INVALIDVALUELENGTH&100";
        } else if (value < 0) {
            errors.psprdtpr = "INVALIDVALUELENGTHMIN&0";
        }
    }


    //  if (!Validator.isEmpty("" + data.psprddva)) {
    //        const value = parseFloat(data.psprddva);

    //        if (isNaN(value)) {
    //            errors.psprddva = "INVALIDDATAVALUE";
    //        } else if (value > 999999999.99) {
    //            errors.psprddva = "INVALIDVALUELENGTH&999999999.99";
    //        } else if (value < 0) {
    //            errors.psprddva = "INVALIDVALUELENGTHMIN&0";
    //        }
    //    }




    // if (!Validator.isEmpty("" + data.psprdrtg) && isNaN(parseInt(data.psprdrtg))) {
    //     errors.psprdrtg = "INVALIDDATAVALUE";

    // } else if (data.psprdrtg > 5) {
    //     errors.psprdrtg = "INVALIDVALUELENGTH&5";

    // }
    // else if (data.psprdrtg < 0) {
    //     errors.psprdrtg = "INVALIDVALUELENGTHMIN&0"
    // }

    return {
        errors,
        isValid: isEmpty(errors),
    };
};

const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePstrcparInput(data, type) {
  let errors = {};
  // data.psstfuid = !isEmpty(data.psstfuid) ? data.psstfuid : "";
  data.psstfnme = !isEmpty(data.psstfnme) ? data.psstfnme : "";
  data.psmrcuid = !isEmpty(data.psmrcuid) ? data.psmrcuid : "";
  data.psstftyp = !isEmpty(data.psstftyp) ? data.psstftyp : "";
  data.psstfidt = !isEmpty(data.psstfidt) ? data.psstfidt : "";
  data.psstfidn = !isEmpty(data.psstfidn) ? data.psstfidn : "";
  data.psstfprp = !isEmpty(data.psstfprp) ? data.psstfprp : "";
  data.psstfnat = !isEmpty(data.psstfnat) ? data.psstfnat : "";
  // data.psstfsdt = !isEmpty(data.psstfsdt) ? data.psstfsdt : new Date();
  data.psstfjdt = !isEmpty(data.psstfjdt) ? data.psstfjdt : "";
  data.psstfsts = !isEmpty(data.psstfsts) ? data.psstfsts : "Y";
  data.psstfad1 = !isEmpty(data.psstfad1) ? data.psstfad1 : "";
  data.psstfad2 = !isEmpty(data.psstfad2) ? data.psstfad2 : "";
  data.psstfpos = !isEmpty(data.psstfpos) ? data.psstfpos : "";
  data.psstfcit = !isEmpty(data.psstfcit) ? data.psstfcit : "";
  data.psstfsta = !isEmpty(data.psstfsta) ? data.psstfsta : "";
  data.psstfchp = !isEmpty(data.psstfchp) ? data.psstfchp : "";
  data.psstfsam = !isEmpty(data.psstfsam) ? data.psstfsam : "N";
  data.psstfha1 = !isEmpty(data.psstfha1) ? data.psstfha1 : "";
  data.psstfha2 = !isEmpty(data.psstfha2) ? data.psstfha2 : "";
  data.psstfhpo = !isEmpty(data.psstfhpo) ? data.psstfhpo : "";
  data.psstfhci = !isEmpty(data.psstfhci) ? data.psstfhci : "";
  data.psstfhst = !isEmpty(data.psstfhst) ? data.psstfhst : "";
  data.psstfeml = !isEmpty(data.psstfeml) ? data.psstfeml : "";
  data.psstfbnk = !isEmpty(data.psstfbnk) ? data.psstfbnk : "";
  data.psstfacc = !isEmpty(data.psstfacc) ? data.psstfacc : "";
  data.psstfbnm = !isEmpty(data.psstfbnm) ? data.psstfbnm : "";
  data.psstfepr = !isEmpty(data.psstfepr) ? data.psstfepr : "";
  data.psstfehp = !isEmpty(data.psstfehp) ? data.psstfehp : "";
  data.psusrunm = !isEmpty(data.psusrunm) ? data.psusrunm : "";


  // if (type == "A" && Validator.isEmpty(data.psstfuid)) {
  //   errors.psstfuid = "FIELDISREQUIRED";
  // } else if (
  //   type == "A" &&
  //   !Validator.isEmpty(data.psstfuid) &&
  //   data.psstfuid.length > 25
  // )
  //   errors.psstfuid = "INVALIDVALUELENGTH&25";

  if (Validator.isEmpty(data.psstfnme)) {
    errors.psstfnme = "FIELDISREQUIRED";
  } else {
    if (data.psstfnme.length > 255) errors.psstfnme = "INVALIDVALUELENGTH&255";
  }

  if (Validator.isEmpty(data.psstftyp)) {
    errors.psstftyp = "FIELDISREQUIRED";
  } else {
    if (data.psstftyp.length > 10) errors.psstftyp = "INVALIDVALUELENGTH&10";
  }

  if (Validator.isEmpty(data.psstfidt)) {
    errors.psstfidt = "FIELDISREQUIRED";
  } else {
    if (data.psstfidt.length > 10) errors.psstfidt = "INVALIDVALUELENGTH&10";
  }
  if (Validator.isEmpty(data.psstfidn)) {
    errors.psstfidn = "FIELDISREQUIRED";
  } else {
    if (data.psstfidn.length > 25) errors.psstfidn = "INVALIDVALUELENGTH&25";
  }
  if (Validator.isEmpty(data.psmrcuid) && data.psstftyp != "A") {
    errors.psmrcuid = "FIELDISREQUIRED";
  } else {
    if (data.psmrcuid.length > 25) errors.psmrcuid = "INVALIDVALUELENGTH&25";

  }


  if (data.psstfprp.length > 255) errors.psstfprp = "INVALIDVALUELENGTH&255";

  if (Validator.isEmpty(data.psstfnat) && type == 'C') {
    errors.psstfnat = "FIELDISREQUIRED";
  }
  else if (Validator.isEmpty(data.psstfnat) && type == 'A') {
    data.psstfnat = "MY"
  }
  else {
    if (data.psstfnat.length > 10) errors.psstfnat = "INVALIDVALUELENGTH&10";
  }

  if (Validator.isEmpty(data.psstfjdt) && type == 'C') {
    errors.psstfjdt = "FIELDISREQUIRED";
  } else if (!Validator.isEmpty('' + data.psstfjdt)) {
    let newDate = new Date(data.psstfjdt);

    if (isNaN(newDate.getTime())) {
      errors.psstfjdt = "INVALIDDATAVALUE";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newDate > today) {
        errors.psstfjdt = "FUTUREDATE";
      }
    }
  }

  if (Validator.isEmpty(data.psstfsts)) {
    errors.psstfsts = "FIELDISREQUIRED";
  } else {
    if (data.psstfsts.length > 10) errors.psstfsts = "INVALIDVALUELENGTH&10";
  }

  if (Validator.isEmpty(data.psstfad1)) {
    errors.psstfad1 = "FIELDISREQUIRED";
  } else {
    if (data.psstfad1.length > 255) errors.psstfad1 = "INVALIDVALUELENGTH&255";
  }

  if (Validator.isEmpty(data.psstfad2)) {
    errors.psstfad2 = "FIELDISREQUIRED";
  } else {
    if (data.psstfad2.length > 255) errors.psstfad2 = "INVALIDVALUELENGTH&255";
  }

  if (Validator.isEmpty(data.psstfpos)) {
    errors.psstfpos = "FIELDISREQUIRED";
  } else {
    if (data.psstfpos.length > 25) errors.psstfpos = "INVALIDVALUELENGTH&25";
  }

  if (Validator.isEmpty(data.psstfcit)) {
    errors.psstfcit = "FIELDISREQUIRED";
  } else {
    if (data.psstfcit.length > 25) errors.psstfcit = "INVALIDVALUELENGTH&25";
  }

  if (Validator.isEmpty(data.psstfsta)) {
    errors.psstfsta = "FIELDISREQUIRED";
  } else {
    if (data.psstfsta.length > 25) errors.psstfsta = "INVALIDVALUELENGTH&25";
  }

  if (Validator.isEmpty(data.psstfchp)) {
    errors.psstfchp = "FIELDISREQUIRED";
  } else {
    if (data.psstfchp.length > 25) errors.psstfchp = "INVALIDVALUELENGTH&25";
  }

  if (Validator.isEmpty(data.psstfsam)) {
    errors.psstfsam = "FIELDISREQUIRED";
  } else {
    if (data.psstfsam.length > 10) errors.psstfsam = "INVALIDVALUELENGTH&10";
  }

  if (Validator.isEmpty(data.psstfha1) && data.psstfsam == "N") {
    errors.psstfha1 = "FIELDISREQUIRED";
  } else {
    if (data.psstfha1.length > 255) errors.psstfha1 = "INVALIDVALUELENGTH&255";
  }

  if (Validator.isEmpty(data.psstfha2) && data.psstfsam == "N") {
    errors.psstfha2 = "FIELDISREQUIRED";
  } else {
    if (data.psstfha2.length > 255) errors.psstfha2 = "INVALIDVALUELENGTH&255";
  }

  if (Validator.isEmpty(data.psstfhpo) && data.psstfsam == "N") {
    errors.psstfhpo = "FIELDISREQUIRED";
  } else {
    if (data.psstfhpo.length > 25) errors.psstfhpo = "INVALIDVALUELENGTH&25";
  }

  if (Validator.isEmpty(data.psstfhci) && data.psstfsam == "N") {
    errors.psstfhci = "FIELDISREQUIRED";
  } else {
    if (data.psstfhci.length > 25) errors.psstfhci = "INVALIDVALUELENGTH&25";
  }

  if (Validator.isEmpty(data.psstfhst) && data.psstfsam == "N") {
    errors.psstfhst = "FIELDISREQUIRED";
  } else {
    if (data.psstfhst.length > 25) errors.psstfhst = "INVALIDVALUELENGTH&25";
  }

  if (Validator.isEmpty(data.psstfeml)) {
    errors.psstfeml = "FIELDISREQUIRED";
  } else {
    if (data.psstfeml.length > 25) errors.psstfeml = "INVALIDVALUELENGTH&25";
  }

  if (Validator.isEmpty(data.psstfbnk)) {
    errors.psstfbnk = "FIELDISREQUIRED";
  } else {
    if (data.psstfbnk.length > 10) errors.psstfbnk = "INVALIDVALUELENGTH&10";
  }

  if (Validator.isEmpty(data.psstfacc)) {
    errors.psstfacc = "FIELDISREQUIRED";
  } else {
    if (data.psstfacc.length > 25) errors.psstfacc = "INVALIDVALUELENGTH&25";
  }

  if (Validator.isEmpty(data.psstfbnm)) {
    errors.psstfbnm = "FIELDISREQUIRED";
  } else {
    if (data.psstfbnm.length > 255) errors.psstfbnm = "INVALIDVALUELENGTH&255";
  }

  if (Validator.isEmpty(data.psstfepr)) {
    errors.psstfepr = "FIELDISREQUIRED";
  } else {
    if (data.psstfepr.length > 10) errors.psstfepr = "INVALIDVALUELENGTH&10";
  }

  if (Validator.isEmpty(data.psstfehp)) {
    errors.psstfehp = "FIELDISREQUIRED";
  } else {
    if (data.psstfehp.length > 25) errors.psstfehp = "INVALIDVALUELENGTH&25";
  }



  if (Validator.isEmpty(data.psusrunm)) {
    errors.psusrunm = "FIELDISREQUIRED";
  } else {
    if (data.psusrunm.length > 255) errors.psusrunm = "INVALIDVALUELENGTH&255";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

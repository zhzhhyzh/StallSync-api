// Import
const db = require("../models");
const _ = require("lodash");

//Table
const pstrxpar = db.pstrxpar;
const psordpar = db.psordpar;

// Common Functions
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");

// Input Validation
const validatePstrxparInput = require("../validation/pstrxpar-validation");

exports.list = async (req, res) => {
  // default 10 records per page
  let limit = 10;
  if (req.query.limit) limit = parseInt(req.query.limit);

  // page offset
  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * limit;

  // filters (where clause)
  let option = {};

  if (req.query.search && !_.isEmpty(req.query.search)) {
    option[Op.or] = [
      { pstrxuid: { [Op.like]: `%${req.query.search}%` } },
      { psorduid: { [Op.like]: `%${req.query.search}%` } },
    ];
  }

  if (req.query.pstrxsts && !_.isEmpty(req.query.pstrxsts)) {
    option.pstrxsts = req.query.pstrxsts;
  }

  if (req.query.pstrxmtd && !_.isEmpty(req.query.pstrxmtd)) {
    option.pstrxmtd = req.query.pstrxmtd;
  }



  if (req.query.from && !_.isEmpty("" + req.query.from)) {
    let fromDate = new Date(req.query.from);
    fromDate.setHours(0, 0, 0, 0);
    if (!_.isNaN(fromDate.getTime())) {
      if (req.query.to && !_.isEmpty("" + req.query.to)) {
        let toDate = new Date(req.query.to);
        toDate.setHours(23, 59, 59, 999);
        if (!_.isNaN(toDate.getTime())) {
          option.pstrxdat = {
            [Op.and]: [{ [Op.gte]: fromDate }, { [Op.lte]: toDate }],
          };
        } else {
          option.pstrxdat = {
            [Op.gte]: fromDate,
          };
        }
      } else {
        option.pstrxdat = {
          [Op.gte]: fromDate,
        };
      }
    }
  } else if (req.query.to && !_.isEmpty("" + req.query.to)) {
    let toDate = new Date(req.query.to);
    toDate.setHours(23, 59, 59, 999);
    if (!_.isNaN(toDate.getTime())) {
      option.pstrxdat = {
        [Op.lte]: toDate,
      };
    }
  }

  // if (req.query.pstrxdat && !_.isEmpty(req.query.pstrxdat)) {
  //   options[Op.and].push({
  //     pstrxdat: common.getDateFromString(req.query.pstrxdat),
  //   });
  // }

  const { count, rows } = await pstrxpar.findAndCountAll({
    where: option,
    limit: limit,
    offset: from,
    raw: true,
    attributes: [
      "pstrxuid",
      "psorduid",
      "pstrxdat",
      "pstrxamt",
      "pstrxsts",
      "pstrxcrc",
      "pstrxmtd",
      "pstrxba1",
      "pstrxba2",
      "pstrxbpo",
      "pstrxbci",
      "pstrxbst",
      "pstrxstr",
    ],
    order: [["pstrxdat", "DESC"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];

    if (!_.isEmpty(obj.pstrxsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "TRXSTS",
        obj.pstrxsts
      );
      obj.pstrxstsdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(obj.pstrxmtd)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "PYMTD",
        obj.pstrxmtd
      );
      obj.pstrxmtddsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(obj.pstrxcrc)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "CRCY",
        obj.pstrxcrc
      );
      obj.pstrxcrcdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    obj.pstrxdat = await common.formatDate(obj.pstrxdat, "/");
    obj.pstrxamt = await common.formatDecimal(obj.pstrxamt, 2);
    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "pstrxpar", key: ["pstrxuid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.findOne = async (req, res) => {
  const id = req.query.pstrxuid ? req.query.pstrxuid : "";
  if (!id || id == "") {
    return returnError(req, 400, "RECORDIDISREQUIRED", res);
  }
  try {
    const result = await pstrxpar.findOne({
      where: { pstrxuid: id },
      raw: true,
    });

    if (!result) {
      return returnError(req, 400, "RECORDNOTFOUND", res);
    }
    if (!_.isEmpty(result.pstrxsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "TRXSTS",
        result.pstrxsts
      );
      result.pstrxstsdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(result.pstrxmtd)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "PYMTHD",
        result.pstrxmtd
      );
      result.pstrxmtddsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(result.pstrxcrc)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "CRCY",
        result.pstrxcrc
      );
      result.pstrxcrcdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    return returnSuccess(200, { data: result }, res);
  } catch (err) {
    console.log("Error in findOne:", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};

exports.create = async (req, res) => {
  const { errors, isValid } = validatePstrxparInput(req.body, "A");
  if (!isValid) {
    return returnError(req, 400, errors, res);
  }

  try {
    const exist = await pstrxpar.findOne({
      where: { pstrxuid: req.body.pstrxuid },
      raw: true,
    });

    if (exist) {
      return returnError(req, 400, "RECORDEXIST", res);
    }

    let ddlErrors = {};
    let err_ind = false;

    if (!_.isEmpty(req.body.pstrxsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "TRXSTS",
        req.body.pstrxsts
      );
      if (_.isEmpty(description)) {
        ddlErrors.pstrxsts = "INVALIDDATAVALUE";
        err_ind = true;
      }
    }

    if (!_.isEmpty(req.body.pstrxmtd)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "PYMTHD",
        req.body.pstrxmtd
      );
      if (_.isEmpty(description)) {
        ddlErrors.pstrxmtd = "INVALIDDATAVALUE";
        err_ind = true;
      }
    }

    if (!_.isEmpty(req.body.pstrxcrc)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "CRCY",
        req.body.pstrxcrc
      );
      if (_.isEmpty(description)) {
        ddlErrors.pstrxcrc = "INVALIDDATAVALUE";
        err_ind = true;
      }
    }

    if (err_ind) return returnError(req, 400, ddlErrors, res);

    // Generate Code
    let code = await common.getNextRunning("TRX");
    let initial = "T";
    let reference = initial;
    reference += _.padStart(code, 6, "0");

    const order = await psordpar.findOne({
      where: { psorduid: req.body.psorduid },
      raw: true,
    });

    if (!order) return returnError(req, 400, "ORDERNOTFOUND", res);

    const amount = order.psordgra;

    pstrxpar
      .create({
        pstrxuid: reference,
        psorduid: req.body.psorduid,
        pstrxdat: new Date(),
        pstrxamt: amount,
        pstrxsts: req.body.pstrxsts,
        pstrxcrc: req.body.pstrxcrc,
        pstrxmtd: req.body.pstrxmtd,
        pstrxba1: req.body.pstrxba1,
        pstrxba2: req.body.pstrxba2,
        pstrxbpo: req.body.pstrxbpo,
        pstrxbci: req.body.pstrxbci,
        pstrxbst: req.body.pstrxbst,
        pstrxstr: req.body.pstrxstr,
        crtuser: req.user.psusrunm,
        mntuser: req.user.psusrunm,
      })
      .then(async (data) => {
        let created = data.get({ plain: true });
        TRX;
        common.writeMntLog(
          "pstrxpar",
          null,
          null,
          created.pstrxuid,
          "A",
          req.user.psusrunm,
          "",
          created.pstrxuid
        );

        return returnSuccessMessage(req, 200, "RECORDCREATED", res);
      });
  } catch (err) {
    console.log("Error in create:", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};

exports.update = async (req, res) => {
  const id = req.query.pstrxuid ? req.query.pstrxuid : "";
  if (!id || id == "") {
    return returnError(req, 500, "RECORDIDISREQUIRED", res);
  }

  const { errors, isValid } = validatePstrxparInput(req.body, "C");
  if (!isValid) {
    return returnError(req, 400, errors, res);
  }

  try {
    const exist = await pstrxpar.findOne({
      where: { pstrxuid: id },
      raw: true,
    });

    if (!exist) {
      return returnError(req, 400, "NORECORDFOUND", res);
    }

    let ddlErrors = {};
    let err_ind = false;

    if (!_.isEmpty(req.body.pstrxsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "TRXSTS",
        req.body.pstrxsts
      );
      if (_.isEmpty(description)) {
        ddlErrors.pstrxsts = "INVALIDDATAVALUE";
        err_ind = true;
      }
    }

    if (!_.isEmpty(req.body.pstrxmtd)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "PYMTHD",
        req.body.pstrxmtd
      );
      if (_.isEmpty(description)) {
        ddlErrors.pstrxmtd = "INVALIDDATAVALUE";
        err_ind = true;
      }
    }

    if (!_.isEmpty(req.body.pstrxcrc)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "CRCY",
        req.body.pstrxcrc
      );
      if (_.isEmpty(description)) {
        ddlErrors.pstrxcrc = "INVALIDDATAVALUE";
        err_ind = true;
      }
    }

    if (err_ind) return returnError(req, 400, ddlErrors, res);

    await pstrxpar
      .update(
        {
          // psorduid: reference,
          pstrxdat: req.body.pstrxdat ? req.body.pstrxdat : exist.pstrxdat,
          pstrxamt: req.body.pstrxamt,
          pstrxsts: req.body.pstrxsts,
          pstrxcrc: req.body.pstrxcrc,
          pstrxmtd: req.body.pstrxmtd,
          pstrxba1: req.body.pstrxba1,
          pstrxba2: req.body.pstrxba2,
          pstrxbpo: req.body.pstrxbpo,
          pstrxbci: req.body.pstrxbci,
          pstrxbst: req.body.pstrxbst,
          pstrxstr: req.body.pstrxstr,
          mntuser: req.user.psusrunm,
        },
        { where: { pstrxuid: id } }
      )
      .then(() => {
        common.writeMntLog("pstrxpar", null, null, id, "C", req.user.psusrunm);

        return returnSuccessMessage(req, 200, "UPDATESUCCESSFUL", res);
      });
  } catch (err) {
    console.log("Error in update:", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};


exports.delete = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (!id || id == "") {
    return returnError(req, 400, "RECORDIDISREQUIRED", res);
  }

  try {
    const exist = await pstrxpar.findOne({
      where: { pstrxuid: id },
      raw: true,
    });

    if (!exist) {
      return returnError(req, 400, "NORECORDFOUND", res);
    }

    await pstrxpar.destroy({
      where: { pstrxuid: id },
    });

    await common.writeMntLog(
      "pstrxpar",
      null,
      null,
      id,
      "D",
      req.user.psusrunm,
      "",
      id
    );

    return returnSuccessMessage(req, 200, "RECORDDELETED", res);
  } catch (err) {
    console.log("Error in delete:", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};

exports.createStripeSession = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { orderId, products, paymentMethod } = req.body;

  try {
    if (!orderId || !Array.isArray(products) || products.length === 0) {
      return returnError(req, 400, "NORECORDFOUND", res);
    }

    // Get order info from DB
    const order = await psordpar.findOne({
      where: { psorduid: orderId },
      raw: true,
    });

    if (!order) {
      return returnError(req, 400, "ORDERNOTFOUND", res);
    }
    const paymentMethodTypes = Array.isArray(paymentMethod) && paymentMethod.length > 0
      ? paymentMethod
      : ['card']; // default to card
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "myr",
        product_data: {
          name: product.psprdnme,
          images: [product.psprdimg],
        },
        unit_amount: Math.round(Number(product.psprdpri) * 100),
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      line_items: lineItems,
      mode: "payment",
      success_url: `https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://yourdomain.com/cancel`,
      metadata: { psorduid: orderId },
    });

    // Generate transaction ID (TRX000001)
    const code = await common.getNextRunning("TRX");
    const trxId = "T" + _.padStart(code, 6, "0");

    // Insert transaction as pending
    await pstrxpar.create({
      pstrxuid: trxId,
      psorduid: orderId,
      pstrxdat: new Date(),
      pstrxamt: order.psordgra,
      pstrxsts: "PENDING",
      pstrxcrc: "MYR",
      pstrxmtd: paymentMethodTypes[0].toUpperCase(),
      pstrxstr: session.id,
      crtuser: req.user.psusrunm,
      mntuser: req.user.psusrunm,
    });

    return res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};

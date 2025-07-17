const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// -- Load Common Authentication -- //
const authenticateRoute = require("../common/authenticate");
// -- Load Controller -- //
const pstrxpar = require("../controllers/pstrxpar-controller");

// Common Function
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");
const general = require("../common/general");
const connection = require("../common/db");
//--database--//
// Import
const db = require("../models");

//Table
const pstrxparDB = db.pstrxpar;
const psordpar = db.psordpar;

// @route   GET api/pstrxpar/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, pstrxpar.findOne);

// @route   GET api/pstrxpar/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, pstrxpar.list);

router.post("/createOffline", async (req, res) => {
  const { psorduid, pstrxamt } = req.body;
  console.log("psorduid", psorduid);
  console.log("pstrxamt", pstrxamt);
  if (!psorduid) {
    return returnError(req, 500, "RECORDIDISREQUIRED", res);
  }

  if (!pstrxamt || pstrxamt < 0) {
    return returnError(req, 500, "RECORDIDISREQUIRED", res);
  }

  const transactionId = uuidv4();

  

  // Create a new transaction in DB with status "N"
  await pstrxparDB.create({
    pstrxuid: transactionId,
    psorduid,
    pstrxdat: new Date(),
    pstrxamt: pstrxamt,
    pstrxsts: "N",
    pstrxmtd: "C",
  });

  await psordpar.update(
    {
      psordsts: "G",
    },
    {
      where: { psorduid },
    }
  );

  return returnSuccessMessage(req, 200, "RECORDCREATED", res);
});

router.post("/createOnline", async (req, res) => {

  const { psorduid, pstrxamt, returnUrl } = req.body;

  if (!psorduid || !pstrxamt || !returnUrl) {
    return returnError(req, 500, "RECORDIDISREQUIRED", res);
  }

  // Normalize returnUrl to ensure it includes a valid scheme
  let formattedReturnUrl = returnUrl;
  if (!/^https?:\/\//i.test(returnUrl)) {
    formattedReturnUrl = `https://${returnUrl}`; // fallback to https if not present
  }
  console.log(returnUrl, " LLKK")
  console.log(formattedReturnUrl, " LLKK")

  try {
    const transactionId = uuidv4();

    // Create a new transaction in DB with status "N"
    await pstrxparDB.create({
      pstrxuid: transactionId,
      psorduid,
      pstrxdat: new Date(),
      pstrxamt: pstrxamt,
      pstrxsts: "N",
      pstrxmtd: "O",
    });

    await psordpar.update(
      {
        psordsts: "G",
      },
      {
        where: { psorduid: psorduid },
      }
    );

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: {
              name: `Order ${psorduid}`,
            },
            unit_amount: Math.round(pstrxamt * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // success_url: `http://localhost:${process.env.PORT}/api/pstrxpar/success?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `http://localhost:${process.env.PORT}/api/pstrxpar/cancel`,
      success_url: `${returnUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/checkout/cancel`,
      metadata: {
        transactionId,
        psorduid,
      },
    });

    // Return the session URL to frontend
    res.json({ url: session.url });
  } catch (e) {
    console.log(e);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
});

router.post("/success", async (req, res) => {
  const session_id = req.query.session_id;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("LOOK here for session: \n", session);
    const transactionId = session.metadata.transactionId;
    const psorduid = session.metadata.psorduid;


    // Update your transaction record to 'C' (complete)
    await pstrxparDB.update(
      {
        pstrxsts: "C",
        pstrxstr: session.id,
      },
      {
        where: { pstrxuid: transactionId },
      }
    );

    await psordpar.update(
      {
        psordsts: "P",
      },
      {
        where: { psorduid: psorduid },
      }
    );

    return returnSuccessMessage(req, 200, "RECORDCREATED", res)

  } catch (err) {
    console.error("Stripe success error:", err);
    return returnError(req, 500, "Error in handling payment to success", res);
  }
});

router.get("/cancel", async (req, res) => {
  const session_id = req.query.session_id;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const transactionId = session.metadata.transactionId;
    const psorduid = session.metadata.psorduid;

    // Update your transaction record to 'C' (complete)
    await pstrxparDB.update(
      {
        pstrxsts: "CA",
        pstrxstr: session.id,
      },
      {
        where: { pstrxuid: transactionId },
      }
    );

    await psordpar.update(
      {
        psordsts: "N",
      },
      {
        where: { psorduid: psorduid },
      }
    );

    return returnSuccessMessage(req, 200, "RECORDCREATED", res)
  } catch (err) {
    console.error("Stripe success error:", err);
    return returnError(req, 500, "Error in verifying payment to cancel", res);

  }
});

module.exports = router;

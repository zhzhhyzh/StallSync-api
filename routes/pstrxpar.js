const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// -- Load Common Authentication -- //
const authenticateRoute = require("../common/authenticate");
// -- Load Controller -- //
const pstrxpar = require("../controllers/pstrxpar-controller");
const returnSuccessMessage = require("../common/successMessage");

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


router.post('/createOffline', async (req, res) => {
    const { psorduid, pstrxamt } = req.body;

    if (!psorduid) {
        return returnError(req, 500, { psorduid: "RECORDIDISREQUIRED" }, res);
    }

    if (!pstrxamt) {
        return returnError(req, 500, { pstrxamt: "RECORDIDISREQUIRED" }, res);
    }

    const transactionId = uuidv4();

    // Create a new transaction in DB with status "N"
    await pstrxparDB.create({
        pstrxuid: transactionId,
        psorduid,
        pstrxdat: new Date(),
        pstrxamt: pstrxamt,
        pstrxsts: 'N',
        pstrxmtd: 'C',
    });

    await psordpar.update({
        psordsts: 'G',

    }, {
        where: { psorduid: psorduid }
    });

    return returnSuccessMessage(req, 200, "RECORDCREATED", res);
});


router.post('/createOnline', async (req, res) => {
    const { psorduid, pstrxamt } = req.body;

    if (!psorduid) {
        return returnError(req, 500, { psorduid: "RECORDIDISREQUIRED" }, res);
    }

    if (!pstrxamt) {
        return returnError(req, 500, { pstrxamt: "RECORDIDISREQUIRED" }, res);
    }

    const transactionId = uuidv4();

    // Create a new transaction in DB with status "N"
    await pstrxparDB.create({
        pstrxuid: transactionId,
        psorduid,
        pstrxdat: new Date(),
        pstrxamt: pstrxamt,
        pstrxsts: 'N',
        pstrxmtd: 'O',
    });

    await psordpar.update({
        psordsts: 'G',

    }, {
        where: { psorduid: psorduid }
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: "myr",
                product_data: {
                    name: `Order ${psorduid}`,
                },
                unit_amount: Math.round(pstrxamt * 100),
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `http://localhost:${process.env.PORT}/api/pstrxpar/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:${process.env.PORT}/api/pstrxpar/cancel`,
        metadata: {
            transactionId,
            psorduid
        }
    });

    // Return the session URL to frontend
    res.json({ url: session.url });
});


router.get('/success', async (req, res) => {
    const session_id = req.query.session_id;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        console.log("LOOK here for session: \n", session)
        const transactionId = session.metadata.transactionId;
        const psorduid = session.metadata.psorduid;
        // Update your transaction record to 'C' (complete)
        await pstrxparDB.update({
            pstrxsts: 'C',
            pstrxstr: session.id,

        }, {
            where: { pstrxuid: transactionId }
        });

        await psordpar.update({
            psordsts: 'P',

        }, {
            where: { psorduid: psorduid }
        });

        return res.status(200).send("Payment successful and transaction updated. \n Get back to merchant for further operations!");
    } catch (err) {
        console.error("Stripe success error:", err);
        return res.status(500).send("Error verifying payment.");
    }
});

router.get('/cancel', async (req, res) => {
    const session_id = req.query.session_id;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);

        const transactionId = session.metadata.transactionId;

        // Update your transaction record to 'C' (complete)
        await pstrxparDB.update({
            pstrxsts: 'CA',
            pstrxstr: session.id,

        }, {
            where: { pstrxuid: transactionId }
        });

        await psordpar.update({
            psordsts: 'N',

        }, {
            where: { psorduid: psorduid }
        });

        return res.status(200).send("Payment failed. Get back to merchant for futher information");
    } catch (err) {
        console.error("Stripe success error:", err);
        return res.status(500).send("Error verifying payment.");
    }
});

module.exports = router;

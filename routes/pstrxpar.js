const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// -- Load Common Authentication -- //
const authenticateRoute = require("../common/authenticate");
// -- Load Controller -- //
const pstrxpar = require("../controllers/pstrxpar-controller");

// @route   GET api/pstrxpar/find-one
// @desc    Find OTP Parameter
// @access  Private
router.get("/detail", authenticateRoute, pstrxpar.findOne);

// @route   GET api/pstrxpar/list
// @desc    List OTP Parameter
// @access  Private
router.get("/list", authenticateRoute, pstrxpar.list);

// @route   POST api/pstrxpar/create
// @desc    Create OTP Parameter
// @access  Private
router.post("/create", authenticateRoute, pstrxpar.create);

// @route   POST api/pstrxpar/delete
// @desc    Delete OTP Parameter
// @access  Private
router.post("/delete", authenticateRoute, pstrxpar.delete);

// @route   POST api/pstrxpar/update
// @desc    Update OTP Parameter
// @access  Private
router.post("/update", authenticateRoute, pstrxpar.update);

router.post("/create-checkout-session", authenticateRoute, pstrxpar.createStripeSession);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { orderId, products } = req.body;

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "myr",
        product_data: {
          name: product.psprdnme,
          images: [product.psprdimg],
        },
        unit_amount: Math.round(Number(product.psprdpri) * 100),
        quantity: product.quantity,
      },
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['fpx', 'grabpay', 'card'], //card, fpx, grabpay, alipay, card+UnionPay BIN, wechat_pay, konbini, promptpay
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:5040/payment-success?orderId=${orderId}",
      cancel_url: "http://localhost:5040/payment-cancelled?orderId=${orderId}",
    });

    //  create a pstrxpar record here (with psorduid, session.id, etc.)
    res.json({ id:session.id});
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});
module.exports = router;

// routes/stripe.route.js
const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const authMiddleware = require('../middlewares/auth');

router.get('/plans', authMiddleware, stripeController.getPlans);
router.post('/create-checkout-session', authMiddleware, stripeController.createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

module.exports = router;
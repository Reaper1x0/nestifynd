// controllers/stripeController.js
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching plans' });
  }
};

exports.createCheckoutSession = async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  if (!stripe) {
    return res.status(503).json({ message: 'Payment service not configured. Please set STRIPE_SECRET_KEY environment variable.' });
  }

  try {
    const plan = await Plan.findById(planId);
    if (!plan || !plan.stripePriceId) {
      return res.status(404).json({ message: 'Plan not found or not configured' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: plan.stripePriceId,
        quantity: 1
      }],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      customer_email: user.email
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
};

exports.handleWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Payment service not configured. Please set STRIPE_SECRET_KEY environment variable.' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const user = await User.findOne({ email: session.customer_email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    const plan = await Plan.findOne({ stripePriceId: subscription.items.data[0].price.id });

    const newSub = new Subscription({
      userId: user._id,
      planId: plan._id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });

    await newSub.save();

    user.plan = plan.name;
    await user.save();
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const dbSub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });

    if (dbSub) {
      dbSub.status = 'canceled';
      dbSub.canceledAt = new Date();
      await dbSub.save();

      const user = await User.findById(dbSub.userId);
      if (user) {
        user.plan = 'Free';
        await user.save();
      }
    }
  }

  res.json({ received: true });
};
import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
});

// Pricing plans
const PLANS = {
  BASIC: {
    monthly: 2.99,
    yearly: 29.99,
    priceIdMonthly: 'price_basic_monthly',
    priceIdYearly: 'price_basic_yearly'
  },
  PRO: {
    monthly: 5.99,
    yearly: 59.99,
    priceIdMonthly: 'price_pro_monthly',
    priceIdYearly: 'price_pro_yearly'
  },
  ELITE: {
    monthly: 9.99,
    yearly: 99.99,
    priceIdMonthly: 'price_elite_monthly',
    priceIdYearly: 'price_elite_yearly'
  }
};

// Create checkout session
router.post('/checkout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { tier, interval } = req.body; // tier: BASIC/PRO/ELITE, interval: monthly/yearly

    if (!['BASIC', 'PRO', 'ELITE'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    if (!['monthly', 'yearly'].includes(interval)) {
      return res.status(400).json({ error: 'Invalid interval' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId! }
    });

    let customerId = (await prisma.subscription.findUnique({
      where: { userId: req.userId! }
    }))?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user!.email,
        metadata: {
          userId: req.userId!
        }
      });
      customerId = customer.id;
    }

    const priceId = interval === 'monthly' 
      ? PLANS[tier as keyof typeof PLANS].priceIdMonthly
      : PLANS[tier as keyof typeof PLANS].priceIdYearly;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId: req.userId!,
        tier
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Get subscription status
router.get('/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId! }
    });

    if (!subscription) {
      return res.json({
        tier: 'FREE',
        status: 'inactive'
      });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Cancel subscription
router.post('/cancel', authenticate, async (req: AuthRequest, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId! }
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription' });
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await prisma.subscription.update({
      where: { userId: req.userId! },
      data: { cancelAtPeriodEnd: true }
    });

    res.json({ message: 'Subscription will be cancelled at period end' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as any;
      await handleCheckoutComplete(session);
      break;

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as any;
      await handleSubscriptionUpdate(subscription);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

async function handleCheckoutComplete(session: any) {
  const userId = session.metadata.userId;
  const tier = session.metadata.tier;

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      tier: tier,
      status: 'active',
      currentPeriodEnd: new Date(session.current_period_end * 1000)
    },
    create: {
      userId,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      tier: tier,
      status: 'active',
      currentPeriodEnd: new Date(session.current_period_end * 1000)
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionExpiry: new Date(session.current_period_end * 1000)
    }
  });
}

async function handleSubscriptionUpdate(subscription: any) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!sub) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  });

  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    await prisma.user.update({
      where: { id: sub.userId },
      data: {
        subscriptionTier: 'FREE',
        subscriptionExpiry: null
      }
    });
  }
}

export default router;

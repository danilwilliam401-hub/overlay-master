import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['paymongo-signature'];
    const payload = JSON.stringify(req.body);
    
    const expectedSig = crypto
      .createHmac('sha256', process.env.PAYMONGO_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSig) {
      console.error('Invalid PayMongo webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body.data;
    const eventType = event.attributes.type;

    console.log('PayMongo webhook received:', eventType);

    switch (eventType) {
      case 'checkout_session.payment.paid':
        await handlePaymentPaid(event.attributes.data);
        break;

      case 'payment.paid':
        await handleDirectPaymentPaid(event.attributes.data);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.attributes.data);
        break;

      default:
        console.log('Unhandled PayMongo event type:', eventType);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('PayMongo webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handlePaymentPaid(checkoutSession) {
  const metadata = checkoutSession.attributes.metadata;
  const { userId, userEmail, plan, billingCycle } = metadata;

  // Create subscription
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      plan,
      status: 'active',
      billingCycle,
      provider: 'paymongo',
      providerSubscriptionId: checkoutSession.id,
      amount: checkoutSession.attributes.line_items[0].amount / 100,
      currency: checkoutSession.attributes.line_items[0].currency,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      subscriptionId: subscription.id,
      provider: 'paymongo',
      providerPaymentId: checkoutSession.attributes.payment_intent.id,
      paymentMethod: checkoutSession.attributes.payment_method_used,
      amount: checkoutSession.attributes.line_items[0].amount / 100,
      currency: checkoutSession.attributes.line_items[0].currency,
      status: 'succeeded',
    },
  });

  console.log(`✅ Subscription created for user ${userEmail}`);
}

async function handleDirectPaymentPaid(payment) {
  // Handle direct payment (non-subscription)
  console.log('Direct payment received:', payment.id);
}

async function handlePaymentFailed(payment) {
  console.log('Payment failed:', payment.id);
  // Update payment status, send notification, etc.
}

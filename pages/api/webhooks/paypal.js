import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(req);
    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const eventType = event.event_type;

    console.log('PayPal webhook received:', eventType);

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptured(event.resource);
        break;

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(event.resource);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event.resource);
        break;

      default:
        console.log('Unhandled PayPal event type:', eventType);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function verifyPayPalWebhook(req) {
  // Simplified verification - in production, verify with PayPal API
  // See: https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#verify-signature
  return true; // TODO: Implement proper verification
}

async function handlePaymentCaptured(capture) {
  const customId = JSON.parse(capture.custom_id || '{}');
  const { userId, userEmail, plan, billingCycle } = customId;

  if (!userId) return;

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      provider: 'paypal',
      providerPaymentId: capture.id,
      paymentMethod: 'paypal',
      amount: parseFloat(capture.amount.value),
      currency: capture.amount.currency_code,
      status: 'succeeded',
    },
  });

  console.log(`✅ Payment captured for user ${userEmail}`);
}

async function handleSubscriptionActivated(subscription) {
  console.log('Subscription activated:', subscription.id);
  // Create subscription record in database
}

async function handleSubscriptionCancelled(subscription) {
  console.log('Subscription cancelled:', subscription.id);
  
  // Update subscription status
  await prisma.subscription.updateMany({
    where: {
      providerSubscriptionId: subscription.id,
      provider: 'paypal',
    },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
  });
}

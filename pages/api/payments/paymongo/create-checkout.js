/**
 * PayMongo Checkout Session API
 * Creates a checkout session for one-time or subscription payments
 * 
 * POST /api/payments/paymongo/create-checkout
 * Body: { plan, billingCycle, successUrl, cancelUrl }
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PayMongo API Configuration
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

// Plan pricing (in cents - USD)
const PLANS = {
  starter: {
    monthly: { amount: 1900, description: 'Starter Plan - Monthly' }, // $19
    yearly: { amount: 19900, description: 'Starter Plan - Yearly' }   // $199
  },
  pro: {
    monthly: { amount: 4900, description: 'Pro Plan - Monthly' },    // $49
    yearly: { amount: 49900, description: 'Pro Plan - Yearly' }      // $499
  },
  enterprise: {
    monthly: { amount: 19900, description: 'Enterprise Plan - Monthly' }, // $199
    yearly: { amount: 199900, description: 'Enterprise Plan - Yearly' }   // $1,999
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { plan, billingCycle = 'monthly', successUrl, cancelUrl } = req.body;

    // Validate plan
    if (!PLANS[plan] || !PLANS[plan][billingCycle]) {
      return res.status(400).json({ error: 'Invalid plan or billing cycle' });
    }

    const planDetails = PLANS[plan][billingCycle];

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create checkout session with PayMongo
    const checkoutData = {
      data: {
        attributes: {
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          line_items: [
            {
              currency: 'USD',
              amount: planDetails.amount,
              name: planDetails.description,
              quantity: 1
            }
          ],
          payment_method_types: [
            'card',
            'gcash',
            'grab_pay',
            'paymaya'
          ],
          success_url: successUrl || `${process.env.NEXTAUTH_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/checkout`,
          description: planDetails.description,
          metadata: {
            userId: user.id,
            userEmail: user.email,
            plan,
            billingCycle
          }
        }
      }
    };

    console.log('Creating PayMongo checkout session:', checkoutData);

    const response = await fetch(`${PAYMONGO_API_URL}/checkout_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')}`
      },
      body: JSON.stringify(checkoutData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('PayMongo API error:', responseData);
      throw new Error(responseData.errors?.[0]?.detail || 'Failed to create checkout session');
    }

    console.log('✅ Checkout session created:', responseData.data.id);

    return res.status(200).json({
      sessionId: responseData.data.id,
      checkoutUrl: responseData.data.attributes.checkout_url,
      paymentIntentId: responseData.data.attributes.payment_intent?.id
    });

  } catch (error) {
    console.error('Create checkout error:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
}

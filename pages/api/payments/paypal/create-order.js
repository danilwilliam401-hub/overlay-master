import { getSession } from 'next-auth/react';

const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Plan pricing in USD
const PLANS = {
  starter: { monthly: 19, yearly: 199 },
  pro: { monthly: 49, yearly: 499 },
  enterprise: { monthly: 199, yearly: 1999 },
};

// Get PayPal access token
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { plan, billingCycle = 'monthly' } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ error: 'Invalid billing cycle' });
    }

    const amount = PLANS[plan][billingCycle];
    const accessToken = await getPayPalAccessToken();

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount.toString(),
          },
          description: `${plan.toUpperCase()} Plan - ${billingCycle}`,
          custom_id: JSON.stringify({
            userId: session.user.id,
            userEmail: session.user.email,
            plan,
            billingCycle,
          }),
        }],
        application_context: {
          brand_name: 'Your SaaS App',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXTAUTH_URL}/billing?success=true`,
          cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=true`,
        },
      }),
    });

    const order = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('PayPal order creation failed:', order);
      return res.status(500).json({ error: 'Failed to create PayPal order' });
    }

    const approvalUrl = order.links.find(link => link.rel === 'approve')?.href;

    return res.status(200).json({
      orderId: order.id,
      approvalUrl,
    });

  } catch (error) {
    console.error('PayPal create-order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

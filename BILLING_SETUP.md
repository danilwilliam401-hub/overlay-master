# 💳 Payment & Billing System Setup Guide

Complete payment integration with PayMongo (Philippine payments) and PayPal (International)

---

## 📋 Table of Contents
1. [Environment Variables](#environment-variables)
2. [Database Setup](#database-setup)
3. [PayMongo Setup](#paymongo-setup)
4. [PayPal Setup](#paypal-setup)
5. [API Routes Reference](#api-routes)
6. [Frontend Integration](#frontend)
7. [Webhook Configuration](#webhooks)
8. [Testing](#testing)

---

## 🔧 Environment Variables

Add to `.env.local`:

```env
# PayMongo (Philippines)
PAYMONGO_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYMONGO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYMONGO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# PayPal (International)
PAYPAL_CLIENT_ID=xxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=xxxxxxxxxxxxx
PAYPAL_MODE=sandbox  # or 'live' for production

# Webhooks
PAYMONGO_WEBHOOK_URL=https://yourdomain.com/api/webhooks/paymongo
PAYPAL_WEBHOOK_URL=https://yourdomain.com/api/webhooks/paypal
```

---

## 🗄️ Database Setup

Run migration to add billing tables:

```bash
npx prisma migrate dev --name add_billing_tables
npx prisma generate
```

This creates:
- `subscriptions` - User subscription records
- `payments` - Payment transactions  
- `invoices` - Invoice records

---

## 🇵🇭 PayMongo Setup

### 1. Create Account
- Go to https://dashboard.paymongo.com/
- Sign up for an account
- Get your test keys from Dashboard > Developers > API Keys

### 2. Enable Payment Methods
In Dashboard > Settings > Payment Methods, enable:
- ✅ Cards (Visa, Mastercard)
- ✅ GCash
- ✅ GrabPay
- ✅ PayMaya

### 3. Configure Webhooks
1. Go to Dashboard > Developers > Webhooks
2. Create webhook with URL: `https://yourdomain.com/api/webhooks/paymongo`
3. Subscribe to events:
   - `checkout_session.payment.paid`
   - `payment.paid`
   - `payment.failed`
4. Copy webhook signing secret to `PAYMONGO_WEBHOOK_SECRET`

---

## 💰 PayPal Setup

### 1. Create Developer Account
- Go to https://developer.paypal.com/
- Log in with PayPal account
- Create a Sandbox Business account

### 2. Create REST API App
1. Go to Dashboard > My Apps & Credentials
2. Click "Create App"
3. Choose "Merchant" as app type
4. Copy Client ID and Secret

### 3. Enable Subscriptions
- In App settings, enable "Subscriptions" product
- Create subscription plans in https://www.paypal.com/billing/plans

### 4. Configure Webhooks
1. In App settings, add webhook URL
2. Subscribe to events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`

---

## 🛣️ API Routes

### Payment Creation

**PayMongo Checkout**
```javascript
POST /api/payments/paymongo/create-checkout
Body: {
  plan: 'starter' | 'pro' | 'enterprise',
  billingCycle: 'monthly' | 'yearly',
  successUrl: '/billing?success=true',
  cancelUrl: '/checkout'
}
Response: { sessionId, checkoutUrl }
```

**PayPal Order**
```javascript
POST /api/payments/paypal/create-order
Body: {
  plan: 'starter' | 'pro' | 'enterprise',
  billingCycle: 'monthly' | 'yearly'
}
Response: { orderId, approvalUrl }
```

### Payment Verification

```javascript
GET /api/payments/paymongo/verify?session_id=xxx
GET /api/payments/paypal/verify?order_id=xxx
```

### Subscription Management

```javascript
GET /api/billing/subscription - Get active subscription
POST /api/billing/cancel - Cancel subscription
POST /api/billing/upgrade - Upgrade plan
```

---

## 💻 Frontend Integration

### Checkout Flow

```javascript
// On checkout page
const handlePayMongo = async (plan) => {
  const res = await fetch('/api/payments/paymongo/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, billingCycle: 'monthly' })
  });
  
  const { checkoutUrl } = await res.json();
  window.location.href = checkoutUrl; // Redirect to PayMongo
};

const handlePayPal = async (plan) => {
  const res = await fetch('/api/payments/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, billingCycle: 'monthly' })
  });
  
  const { approvalUrl } = await res.json();
  window.location.href = approvalUrl; // Redirect to PayPal
};
```

### Return URLs

After payment, users return to:
- Success: `/billing?session_id={CHECKOUT_SESSION_ID}` or `/billing?success=true`
- Cancel: `/checkout` or `/billing?canceled=true`

---

## 🔔 Webhooks

### Webhook Security

Both PayMongo and PayPal sign webhook requests. Always verify signatures:

```javascript
// PayMongo webhook verification
import crypto from 'crypto';

const signature = req.headers['paymongo-signature'];
const payload = JSON.stringify(req.body);
const expectedSig = crypto
  .createHmac('sha256', process.env.PAYMONGO_WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expectedSig) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### Handling Events

```javascript
// /api/webhooks/paymongo.js
export default async function handler(req, res) {
  // Verify signature
  
  const event = req.body.data;
  const eventType = event.attributes.type;
  
  switch (eventType) {
    case 'checkout_session.payment.paid':
      // Create subscription in database
      await createSubscription(event.attributes.data);
      break;
      
    case 'payment.failed':
      // Update payment status
      await handleFailedPayment(event.attributes.data);
      break;
  }
  
  return res.status(200).json({ received: true });
}
```

---

## 🧪 Testing

### Test Cards (PayMongo)

```
Success: 4343434343434345
Decline: 4571736000000075
3D Secure: 4120000000000007
```

### Test E-Wallets

Use PayMongo test mode - no real money involved

### PayPal Sandbox

Use sandbox accounts from https://developer.paypal.com/developer/accounts/

---

## 📊 Pricing Plans

Current pricing structure (in `create-checkout.js`):

```javascript
starter: {
  monthly: ₱999,   // 99900 centavos
  yearly: ₱9,999   // 999900 centavos
},
pro: {
  monthly: ₱2,900,
  yearly: ₱29,000
},
enterprise: {
  monthly: ₱9,900,
  yearly: ₱99,000
}
```

---

## 🚀 Deployment Checklist

- [ ] Add all environment variables to production
- [ ] Switch PayMongo to live keys
- [ ] Switch PayPal to production mode
- [ ] Update webhook URLs to production domain
- [ ] Test webhooks with real payments
- [ ] Set up monitoring/alerting for failed payments
- [ ] Enable database backups
- [ ] Test subscription renewal flows
- [ ] Verify invoice generation
- [ ] Set up customer support for billing issues

---

## 📝 Next Steps

1. Run `npx prisma migrate dev --name add_billing_tables`
2. Add environment variables
3. Test with PayMongo test cards
4. Implement billing dashboard UI
5. Test webhook flows
6. Deploy and configure production webhooks

---

## 🆘 Troubleshooting

**"Invalid API key"**
- Check environment variables are set correctly
- Verify you're using correct mode (test vs live)

**"Webhook not receiving events"**
- Ensure webhook URL is publicly accessible (use ngrok for local testing)
- Verify webhook secret matches
- Check webhook signature verification

**"Payment succeeded but subscription not created"**
- Check webhook logs in provider dashboard
- Verify database connection
- Check server logs for errors

---

For additional help:
- PayMongo Docs: https://developers.paymongo.com/
- PayPal Docs: https://developer.paypal.com/docs/api/overview/

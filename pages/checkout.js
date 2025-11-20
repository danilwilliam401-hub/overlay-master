import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from '../styles/Checkout.module.css';

const PLANS = {
  starter: {
    name: 'Starter',
    monthly: 19,
    yearly: 199,
    description: 'Perfect for small projects and testing',
    features: [
      '10,000 API requests/month',
      'Basic support',
      'Standard fonts',
      'Email support',
      'Community access'
    ],
  },
  pro: {
    name: 'Pro',
    monthly: 49,
    yearly: 499,
    description: 'Best for growing businesses',
    features: [
      '100,000 API requests/month',
      'Priority support',
      'All premium fonts',
      'Custom designs',
      'Advanced analytics',
      'API documentation'
    ],
    featured: true,
  },
  enterprise: {
    name: 'Enterprise',
    monthly: 199,
    yearly: 1999,
    description: 'For large-scale operations',
    features: [
      'Unlimited API requests',
      '24/7 premium support',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'White-label options'
    ],
  },
};

export default function Checkout() {
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handlePayMongo = async () => {
    if (!session) {
      window.location.href = '/signin';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/paymongo/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          billingCycle,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPal = async () => {
    if (!session) {
      window.location.href = '/signin';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          billingCycle,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = data.approvalUrl;
      } else {
        alert('Failed to create PayPal order');
      }
    } catch (error) {
      console.error('PayPal error:', error);
      alert('Failed to create PayPal order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <Link href="/landing" className={styles.backLink}>
          ← Back to Home
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Choose Your Plan</h1>
          <p className={styles.subtitle}>
            Select the perfect plan for your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className={styles.billingToggleContainer}>
          <div className={styles.billingToggle}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.toggleBtnActive : ''}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`${styles.toggleBtn} ${billingCycle === 'yearly' ? styles.toggleBtnActive : ''}`}
            >
              Yearly
              <span className={styles.saveBadge}>Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className={styles.plansGrid}>
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`
                ${styles.planCard} 
                ${selectedPlan === key ? styles.planCardSelected : ''}
                ${plan.featured ? styles.planCardFeatured : ''}
              `}
            >
              {plan.featured && (
                <div className={styles.popularBadge}>Most Popular</div>
              )}
              
              <div className={styles.checkmark}>✓</div>

              <h3 className={styles.planName}>{plan.name}</h3>
              
              <div className={styles.planPrice}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>
                  {formatAmount(plan[billingCycle]).replace('$', '').split('.')[0]}
                </span>
                <span className={styles.period}>
                  /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>

              <p className={styles.planDescription}>{plan.description}</p>

              <ul className={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className={styles.featureItem}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className={styles.paymentSection}>
          <h2 className={styles.paymentTitle}>Select Payment Method</h2>
          <p className={styles.paymentSubtitle}>
            Choose your preferred payment provider to complete your purchase
          </p>
          
          <div className={styles.paymentButtons}>
            <button
              onClick={handlePayMongo}
              disabled={loading}
              className={`${styles.paymentBtn} ${styles.paymongoBtn} ${loading ? styles.loading : ''}`}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className={styles.paymentIcon}>💳</span>
                  Pay with PayMongo (Philippines)
                </>
              )}
            </button>

            <button
              onClick={handlePayPal}
              disabled={loading}
              className={`${styles.paymentBtn} ${styles.paypalBtn} ${loading ? styles.loading : ''}`}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className={styles.paymentIcon}>🌐</span>
                  Pay with PayPal (International)
                </>
              )}
            </button>
          </div>

          <div className={styles.paymentInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}>🇵🇭</span>
              <span>PayMongo: Cards, GCash, GrabPay, PayMaya</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}>🌍</span>
              <span>PayPal: International payments accepted</span>
            </div>
          </div>

          <div className={styles.securityBadge}>
            <span className={styles.securityIcon}>🔒</span>
            <span>Secure payment processing with industry-standard encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

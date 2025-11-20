import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import styles from '../styles/Billing.module.css';

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    };
  }

  // Get active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ['active', 'past_due'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get payment history
  const payments = await prisma.payment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    props: {
      subscription: subscription ? JSON.parse(JSON.stringify(subscription)) : null,
      payments: JSON.parse(JSON.stringify(payments)),
    },
  };
}

export default function Billing({ subscription, payments }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      if (res.ok) {
        alert('Subscription cancelled successfully');
        window.location.reload();
      } else {
        alert('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel subscription');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <Link href="/dashboard" className={styles.backLink}>
          ← Back to Dashboard
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Billing & Subscription</h1>
          <p className={styles.subtitle}>
            Manage your subscription and view payment history
          </p>
        </div>

        {/* Current Subscription */}
        <div className={styles.subscriptionCard}>
          <h2 className={styles.sectionTitle}>Current Plan</h2>
          
          {subscription ? (
            <div>
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{subscription.plan} Plan</h3>
                <span className={`
                  ${styles.statusBadge}
                  ${subscription.status === 'active' ? styles.statusActive : 
                    subscription.status === 'past_due' ? styles.statusPastDue : 
                    styles.statusCancelled}
                `}>
                  {subscription.status}
                </span>
              </div>

              <div className={styles.planDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Amount</span>
                  <span className={styles.detailValue}>
                    {formatAmount(subscription.amount, subscription.currency)}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Billing Cycle</span>
                  <span className={styles.detailValue}>
                    {subscription.billingCycle}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Next Billing Date</span>
                  <span className={styles.detailValue}>
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Provider</span>
                  <span className={styles.detailValue}>
                    {subscription.provider.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  onClick={() => window.location.href = '/checkout'}
                  className={`${styles.actionBtn} ${styles.upgradeBtn}`}
                >
                  🚀 Upgrade Plan
                </button>

                <button
                  onClick={handleCancelSubscription}
                  className={`${styles.actionBtn} ${styles.cancelBtn}`}
                >
                  ✕ Cancel Subscription
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.noSubscription}>
              <div className={styles.noSubIcon}>📦</div>
              <p className={styles.noSubText}>
                You don't have an active subscription yet.
              </p>
              <button
                onClick={() => window.location.href = '/checkout'}
                className={`${styles.actionBtn} ${styles.choosePlanBtn}`}
              >
                Choose a Plan
              </button>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className={styles.historyCard}>
          <h2 className={styles.sectionTitle}>Payment History</h2>
          
          {payments.length === 0 ? (
            <div className={styles.noHistory}>
              No payment history yet.
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Provider</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className={`${styles.tableCell} ${styles.amount}`}>
                        {formatAmount(payment.amount, payment.currency)}
                      </td>
                      <td className={`${styles.tableCell} ${styles.provider}`}>
                        {payment.provider}
                      </td>
                      <td className={`${styles.tableCell} ${styles.method}`}>
                        {payment.paymentMethod}
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`
                          ${styles.paymentStatus}
                          ${payment.status === 'succeeded' ? styles.statusSucceeded : 
                            payment.status === 'pending' ? styles.statusPending : 
                            styles.statusFailed}
                        `}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

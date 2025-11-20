import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/VerifyEmail.module.css';

export default function EmailVerified() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Email Verified - Overlay Banner API</title>
        <meta name="description" content="Your email has been verified successfully" />
      </Head>

      <div className={styles.container}>
        <div className={styles.card}>
          {/* Success Icon */}
          <div className={styles.iconWrapper}>
            <div className={styles.icon} style={{ fontSize: '80px' }}>✅</div>
          </div>

          {/* Title */}
          <h1 className={styles.title}>Email Verified!</h1>

          {/* Description */}
          <p className={styles.description}>
            Your email address has been successfully verified.
          </p>

          <p className={styles.instructions}>
            You now have full access to all features. Redirecting you to the dashboard...
          </p>

          {/* Success Box */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginTop: '24px',
            marginBottom: '24px',
          }}>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
              🎉 Welcome to Overlay Banner API!
            </p>
          </div>

          {/* Action */}
          <button
            onClick={() => router.push('/dashboard')}
            className={styles.primaryBtn}
          >
            Go to Dashboard Now
          </button>

          {/* Features Preview */}
          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: '#f9fafb',
            borderRadius: '12px',
            textAlign: 'left',
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
              🚀 What's Next?
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: '1.8' }}>
              <li>Create your first API key</li>
              <li>Generate stunning banner overlays</li>
              <li>Choose from 10+ professional themes</li>
              <li>Track your API usage in real-time</li>
              <li>Upgrade to Pro for unlimited requests</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

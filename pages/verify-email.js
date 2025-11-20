import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/VerifyEmail.module.css';

export default function VerifyEmail() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (session?.user?.email) {
      setEmail(session.user.email);
      
      // Check if email is already verified
      if (session.user.emailVerified) {
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }

      setResendSuccess(true);
      setCountdown(60); // 60 second cooldown
      
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setResendError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      // Refresh session to check if email is verified
      const res = await fetch('/api/auth/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await res.json();

      if (data.verified) {
        // Force session refresh
        window.location.href = '/dashboard';
      } else {
        alert('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (err) {
      console.error('Check verification error:', err);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/landing' });
  };

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loader}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Verify Your Email - Overlay Banner API</title>
        <meta name="description" content="Please verify your email address to continue" />
      </Head>

      <div className={styles.container}>
        <div className={styles.card}>
          {/* Icon */}
          <div className={styles.iconWrapper}>
            <div className={styles.icon}>📧</div>
          </div>

          {/* Title */}
          <h1 className={styles.title}>Verify Your Email</h1>

          {/* Description */}
          <p className={styles.description}>
            We've sent a verification email to:
          </p>

          <div className={styles.emailBox}>
            <strong>{email}</strong>
          </div>

          <p className={styles.instructions}>
            Please check your inbox and click the verification link to activate your account.
          </p>

          {/* Success Message */}
          {resendSuccess && (
            <div className={styles.successMessage}>
              ✓ Verification email sent successfully!
            </div>
          )}

          {/* Error Message */}
          {resendError && (
            <div className={styles.errorMessage}>
              {resendError}
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              onClick={handleCheckVerification}
              className={styles.primaryBtn}
            >
              I've Verified My Email
            </button>

            <button
              onClick={handleResendEmail}
              className={styles.secondaryBtn}
              disabled={resending || countdown > 0}
            >
              {resending ? (
                <>
                  <span className={styles.spinner}></span>
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend Verification Email'
              )}
            </button>
          </div>

          {/* Tips */}
          <div className={styles.tips}>
            <h3>📌 Didn't receive the email?</h3>
            <ul>
              <li>Check your spam or junk folder</li>
              <li>Make sure {email} is correct</li>
              <li>Wait a few minutes and try resending</li>
              <li>Add noreply@yourdomain.com to your contacts</li>
            </ul>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p>Wrong email address?</p>
            <button onClick={handleSignOut} className={styles.linkBtn}>
              Sign out and try again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('admin@careerlaunch.com');
  const [password, setPassword] = useState('adminpassword123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.refresh();
        router.push(callbackUrl);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logoBadge}>
          <Shield size={32} className={styles.logoIcon} />
        </div>
        <h2 className={styles.title}>Admin Access Only</h2>
        <p className={styles.subtitle}>Log in to post job updates and manage campaigns.</p>
      </div>

      {error && (
        <div className={styles.error}>
          <Lock size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="admin-email">Email Address</label>
          <div className={styles.inputWrapper}>
            <Mail size={18} className={styles.fieldIcon} />
            <input
              id="admin-email"
              type="email"
              required
              placeholder="admin@careerlaunch.com"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="admin-pass">Password</label>
          <div className={styles.inputWrapper}>
            <KeyRound size={18} className={styles.fieldIcon} />
            <input
              id="admin-pass"
              type="password"
              required
              placeholder="••••••••"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Securing Access...' : 'Verify & Enter'}
        </button>
      </form>

      <div className={styles.footerLink}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={14} /> Back to Homepage
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div className={styles.card}><p>Loading login form...</p></div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

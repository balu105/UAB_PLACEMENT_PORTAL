'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Send } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        setError(data.error || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter error', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          {/* Info */}
          <div className={styles.infoColumn}>
            <div className={styles.brand}>
              <span className={styles.logoIcon}><Briefcase size={26} strokeWidth={2.5} /></span>
              <span>UAB <span className="gradient-text">CAREER LAUNCH</span></span>
            </div>
            <p className={styles.description}>
              Discover enterprise jobs, verify official career sources, and prepare for interviews using advanced Gemini AI services.
            </p>
          </div>

          {/* Quick links: Find Jobs */}
          <div className={styles.linksColumn}>
            <h4 className={styles.title}>Find Jobs</h4>
            <ul className={styles.links}>
              <li><Link href="/jobs?type=Full-time" className={styles.link}>Full-time Jobs</Link></li>
              <li><Link href="/jobs?type=Remote" className={styles.link}>Remote Work</Link></li>
              <li><Link href="/jobs?category=software-engineering" className={styles.link}>Software Engineers</Link></li>
              <li><Link href="/jobs?category=product-management" className={styles.link}>Product Managers</Link></li>
            </ul>
          </div>

          {/* Quick links: Resources */}
          <div className={styles.linksColumn}>
            <h4 className={styles.title}>Resources</h4>
            <ul className={styles.links}>
              <li><Link href="/resources?type=INTERVIEW_QUESTION" className={styles.link}>Interview Cheat-sheets</Link></li>
              <li><Link href="/resources?type=PLACEMENT_PAPER" className={styles.link}>Placement Papers</Link></li>
              <li><Link href="/blogs" className={styles.link}>Career Blog</Link></li>
            </ul>
          </div>

          {/* Quick links: Legal */}
          <div className={styles.linksColumn}>
            <h4 className={styles.title}>Legal</h4>
            <ul className={styles.links}>
              <li><Link href="/privacy" className={styles.link}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={styles.link}>Terms of Service</Link></li>
              <li><Link href="/contact" className={styles.link}>Support Help</Link></li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className={styles.newsletterColumn}>
            <h4 className={styles.title}>Subscribe to Alerts</h4>
            <p className={styles.newsletterText}>
              Receive weekly updates of newly published and verified enterprise jobs directly in your inbox.
            </p>
            {subscribed ? (
              <span className={styles.successMessage}>🎉 You are subscribed successfully!</span>
            ) : (
              <form onSubmit={handleSubscribe} className={styles.form}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  <Send size={16} />
                </button>
              </form>
            )}
            {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</span>}
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <span className={styles.copyright}>
            © {new Date().getFullYear()} UAB CAREER LAUNCH. All rights reserved. 
          </span>
          <div className={styles.socials}>
            <a href="https://github.com" target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="GitHub">
              GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="LinkedIn">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

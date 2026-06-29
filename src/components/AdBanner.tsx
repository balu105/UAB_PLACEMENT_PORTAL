'use client';

import React, { useState, useEffect } from 'react';
import styles from './AdBanner.module.css';

interface Ad {
  id: string;
  title: string;
  placement: 'SIDEBAR' | 'BANNER' | 'INLINE';
  imageUrl: string;
  targetUrl: string;
}

interface AdBannerProps {
  placement: 'SIDEBAR' | 'BANNER' | 'INLINE';
}

export default function AdBanner({ placement }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch ad campaigns for this slot
  useEffect(() => {
    async function fetchAd() {
      try {
        const res = await fetch(`/api/v1/ads/delivery?placement=${placement}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ad) {
            setAd(data.ad);
          }
        }
      } catch (err) {
        console.error('Ad delivery error', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAd();
  }, [placement]);

  const handleAdClick = async () => {
    if (!ad) return;

    // Track ad click asynchronously
    try {
      await fetch('/api/v1/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id }),
      });
    } catch (err) {
      console.error('Ad click log error', err);
    }
  };

  if (loading || !ad) return null;

  const placementClass = styles[`placement_${placement}`] || '';

  return (
    <div className={`${styles.container} ${placementClass}`}>
      <span className={styles.sponsoredLabel}>Sponsored</span>
      
      <a 
        href={ad.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={handleAdClick}
        className={styles.link}
      >
        {placement === 'INLINE' ? (
          <div className={styles.placement_INLINE}>
            <img src={ad.imageUrl} alt={ad.title} className={styles.adImage} />
            <div className={styles.adBody}>
              <span className={styles.adTitle}>{ad.title}</span>
            </div>
          </div>
        ) : (
          <img 
            src={ad.imageUrl} 
            alt={ad.title} 
            className={styles.adImage} 
          />
        )}
      </a>
    </div>
  );
}

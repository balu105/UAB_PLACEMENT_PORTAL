'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, DollarSign, Clock, ShieldCheck, ArrowUpRight, Bookmark } from 'lucide-react';
import styles from './JobCard.module.css';

interface Company {
  name: string;
  logoUrl?: string | null;
  verified: boolean;
}

interface Job {
  id: string;
  title: string;
  slug: string;
  type: string;
  location: string;
  description?: string;
  salaryRange?: string | null;
  skills?: string | null;
  verifiedSource: boolean;
  applyUrl: string;
  company: Company;
}

interface JobCardProps {
  job: Job;
  onApplyClick?: (jobId: string, applyUrl: string, jobTitle: string) => void;
}

export default function JobCard({ job, onApplyClick }: JobCardProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('saved_jobs');
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        setIsBookmarked(parsed.includes(job.id));
      }
    } catch (e) {
      console.error(e);
    }
  }, [job.id]);

  const handleBookmarkToggle = () => {
    try {
      const saved = localStorage.getItem('saved_jobs');
      let parsed: string[] = saved ? JSON.parse(saved) : [];
      if (parsed.includes(job.id)) {
        parsed = parsed.filter(id => id !== job.id);
        setIsBookmarked(false);
      } else {
        parsed.push(job.id);
        setIsBookmarked(true);
      }
      localStorage.setItem('saved_jobs', JSON.stringify(parsed));
      window.dispatchEvent(new Event('bookmarks-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const skillsList = job.skills
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  // Determine dynamic banners
  const hiringTag = job.title.toLowerCase().includes('intern')
    ? 'Internship Drive'
    : job.type.toLowerCase().includes('remote')
    ? 'Remote Campus Drive'
    : 'Off Campus Drive';

  // Set index for gradients
  const gradientIndex = job.title.charCodeAt(0) % 3;
  const gradientClass = 
    gradientIndex === 0 
      ? styles.gradientBlue 
      : gradientIndex === 1 
      ? styles.gradientIndigo 
      : styles.gradientPurple;

  return (
    <div className={styles.card}>
      {/* 1. Header Image Banner */}
      <div className={`${styles.banner} ${gradientClass}`}>
        <div className={styles.bannerOverlay} />
        
        {/* Brand Info */}
        <div className={styles.bannerInfo}>
          <div className={styles.bannerCompany}>
            <span>{job.company.name}</span>
            {job.company.verified && <ShieldCheck size={14} className={styles.verifiedIcon} />}
          </div>
          <div className={styles.bannerHiringTag}>
            {hiringTag}
          </div>
          
          <div className={styles.bannerApplyBadge}>
            Apply Now
          </div>
        </div>

        {/* Corporate Silhouette Graphic overlay */}
        <div className={styles.silhouetteContainer}>
          <div className={styles.silhouetteGlow} />
          <svg className={styles.silhouetteSvg} viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 48c8.837 0 16-7.163 16-16s-7.163-16-16-16-16 7.163-16 16 7.163 16 16 16zm0 8c-14.359 0-26 11.641-26 26h52c0-14.359-11.641-26-26-26z" />
          </svg>
        </div>
      </div>

      {/* 2. Content Details */}
      <div className={styles.content}>
        {/* Job Updates Tag */}
        <div className={styles.badgeRow}>
          <span className={styles.updatesBadge}>Job Updates</span>
        </div>

        {/* Job Title */}
        <h3 className={styles.title}>
          <Link href={`/jobs/${job.slug}`} className={styles.titleLink}>
            {job.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className={styles.excerpt}>
          {(job.description || '').replace(/[#*`_-]/g, '').substring(0, 95)}...
        </p>

        {/* Meta Info */}
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <MapPin size={13} />
            <span>{job.location}</span>
          </div>
          <div className={styles.metaItem}>
            <Clock size={13} />
            <span>{job.type}</span>
          </div>
          {job.salaryRange && (
            <div className={styles.metaItem}>
              <DollarSign size={13} />
              <span>{job.salaryRange}</span>
            </div>
          )}
        </div>

        {/* Skill Pills */}
        {skillsList.length > 0 && (
          <div className={styles.skillsRow}>
            {skillsList.slice(0, 3).map((skill, idx) => (
              <span key={idx} className={styles.skillTag}>
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Bottom Action Footer */}
      <div className={styles.footer}>
        <button
          className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarkBtnActive : ''}`}
          onClick={handleBookmarkToggle}
          title={isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
          aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
        >
          <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
        <button
          className={styles.applyBtn}
          onClick={() => onApplyClick?.(job.id, job.applyUrl, job.title)}
          style={{ width: 'auto', flex: 1 }}
        >
          Apply Now <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}

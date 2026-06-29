'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Bookmark } from 'lucide-react';
import Modal from '@/components/Modal';
import styles from './JobDetailsClient.module.css';

interface Company {
  name: string;
  logoUrl?: string | null;
  website: string;
  verified: boolean;
}

interface Job {
  id: string;
  title: string;
  slug: string;
  type: string;
  location: string;
  salaryRange?: string | null;
  skills?: string | null;
  verifiedSource: boolean;
  applyUrl: string;
  company: Company;
}

interface JobDetailsClientProps {
  job: Job;
}

export default function JobDetailsClient({ job }: JobDetailsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
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

  const handleConfirmApply = async () => {
    try {
      await fetch('/api/v1/jobs/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });
    } catch (err) {
      console.error('Click tracking failed', err);
    }

    setModalOpen(false);
    window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.container}>
      <div className={styles.actionPanel}>
        <button
          className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarkBtnActive : ''}`}
          onClick={handleBookmarkToggle}
        >
          <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
          {isBookmarked ? 'Saved' : 'Save Job'}
        </button>
        <button className={styles.applyBtn} onClick={() => setModalOpen(true)}>
          Apply on Company Site <ExternalLink size={16} />
        </button>
      </div>

      {/* Leaving platform warning modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmApply}
        title="Leaving UAB CAREER LAUNCH"
        description={`You are leaving to apply for "${job.title}" at "${job.company.name}". We will redirect you to their official website.`}
        confirmText="Proceed to Official Site"
        cancelText="Cancel"
        showWarningIcon={true}
      />
    </div>
  );
}

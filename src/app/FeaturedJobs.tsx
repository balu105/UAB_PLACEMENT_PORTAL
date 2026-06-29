'use client';

import React, { useState } from 'react';
import JobCard from '@/components/JobCard';
import Modal from '@/components/Modal';
import styles from './page.module.css';

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

interface FeaturedJobsProps {
  jobs: Job[];
}

export default function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<{ id: string; title: string; url: string } | null>(null);

  const handleApplyClick = (jobId: string, applyUrl: string, jobTitle: string) => {
    setActiveJob({ id: jobId, title: jobTitle, url: applyUrl });
    setModalOpen(true);
  };

  const handleConfirmApply = async () => {
    if (!activeJob) return;

    try {
      await fetch('/api/v1/jobs/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: activeJob.id }),
      });
    } catch (err) {
      console.error('Click tracking failed', err);
    }

    setModalOpen(false);
    window.open(activeJob.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.featuredList}>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onApplyClick={handleApplyClick}
        />
      ))}

      {/* Confirmation warning modal before leaving */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmApply}
        title="Leaving UAB CAREER LAUNCH"
        description={`You are about to be redirected to the official company website to apply for "${activeJob?.title}". Confirm to proceed.`}
        confirmText="Apply on Official Site"
        cancelText="Stay Here"
        showWarningIcon={true}
      />
    </div>
  );
}

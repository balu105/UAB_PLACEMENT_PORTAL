'use client';

import React, { useState } from 'react';
import JobCard from '@/components/JobCard';
import Modal from '@/components/Modal';
import styles from './JobsList.module.css';

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

interface JobsListProps {
  jobs: Job[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export default function JobsList({ jobs, page, totalPages, totalCount }: JobsListProps) {
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Showing <span className="gradient-text">{totalCount}</span> opportunities
        </h2>
      </div>

      {jobs.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No jobs found</h3>
          <p>Try refining your search queries or clearing filters.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApplyClick={handleApplyClick}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => {
              const urlParams = new URLSearchParams(window.location.search);
              urlParams.set('page', String(page - 1));
              window.location.search = urlParams.toString();
            }}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={page >= totalPages}
            onClick={() => {
              const urlParams = new URLSearchParams(window.location.search);
              urlParams.set('page', String(page + 1));
              window.location.search = urlParams.toString();
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Outbound Confirmation Dialog */}
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

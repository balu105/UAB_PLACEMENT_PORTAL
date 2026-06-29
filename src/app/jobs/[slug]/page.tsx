import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/db';
import JobDetailsClient from './JobDetailsClient';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function JobDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch Job from database
  const job = await prisma.job.findUnique({
    where: { slug },
    include: {
      company: true,
      category: true,
    },
  });

  if (!job) {
    notFound();
  }

  // 2. Increment Job View Count
  await prisma.job.update({
    where: { id: job.id },
    data: { views: { increment: 1 } },
  });

  // 3. Construct Structured Schema (Google JobPosting Schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': job.description,
    'datePosted': job.createdAt.toISOString().split('T')[0],
    'employmentType': job.type === 'Full-time' ? 'FULL_TIME' : job.type === 'Part-time' ? 'PART_TIME' : 'CONTRACT',
    'hiringOrganization': {
      '@type': 'Organization',
      'name': job.company.name,
      'sameAs': job.company.website,
      'logo': job.company.logoUrl || undefined,
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.location,
        'addressCountry': 'US',
      },
    },
    'baseSalary': job.salaryRange ? {
      '@type': 'MonetaryAmount',
      'currency': 'USD',
      'value': {
        '@type': 'QuantitativeValue',
        'value': job.salaryRange,
        'unitText': 'YEAR',
      },
    } : undefined,
  };

  const skillsList = job.skills
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <main className={styles.main}>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
          <Link href="/jobs" className={styles.breadcrumbLink}>Jobs</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent} aria-current="page">{job.title}</span>
        </nav>

        {/* Content & Sidebar Grid */}
        <div className={styles.layout}>
          <div className={styles.contentCard}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>{job.title}</h1>
                <div className={styles.companyRow}>
                  <span>{job.company.name}</span>
                  {job.company.verified && (
                    <span className={styles.verifiedBadge} title="Verified Company Partner">
                      <ShieldCheck size={20} />
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.logoContainer}>
                {job.company.logoUrl ? (
                  <img
                    src={job.company.logoUrl}
                    alt={job.company.name}
                    width={72}
                    height={72}
                    className={styles.logo}
                  />
                ) : (
                  <div className={styles.logo} style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {job.company.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info Block */}
            <div className={styles.quickInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Location</span>
                <span className={styles.infoValue}>{job.location}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Salary Estimate</span>
                <span className={styles.infoValue}>{job.salaryRange || 'Not disclosed'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Job Type</span>
                <span className={styles.infoValue}>{job.type}</span>
              </div>
            </div>

            {/* Description */}
            <div className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>Job Description</h2>
              <div className={styles.richText}>{job.description}</div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className={styles.descriptionSection}>
                <h2 className={styles.sectionTitle}>Requirements</h2>
                <div className={styles.richText}>{job.requirements}</div>
              </div>
            )}

            {/* Interactive Apply Actions */}
            <JobDetailsClient job={job} />
          </div>

          {/* Sidebar */}
          <aside className={styles.layoutSidebar}>
            {/* Company Card */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>About the Company</h3>
              <p className={styles.companyDesc}>{job.company.description || 'No description available.'}</p>
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.visitBtn}
              >
                Visit Website
              </a>
            </div>

            {/* Skills Card */}
            {skillsList.length > 0 && (
              <div className={styles.sidebarCard} style={{ marginTop: '24px' }}>
                <h3 className={styles.sidebarTitle}>Key Skills Required</h3>
                <div className={styles.tags}>
                  {skillsList.map((skill, idx) => (
                    <span key={idx} className={styles.tag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import ResourceList from './ResourceList';
import styles from './page.module.css';

interface SearchParams {
  type?: string;
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const type = resolvedParams.type || '';

  // Fetch Career Resources
  const whereClause: any = {};
  if (type) {
    whereClause.type = type;
  }

  const resources = await prisma.resource.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className={styles.main}>
      <div className="container">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent} aria-current="page">Resources</span>
        </nav>

        <h1 className={styles.title}>Interview Prep & Placement Papers</h1>
        <p className={styles.subtitle}>Equip yourself with placement papers, technical guidelines, and system design answers verified by industry architects.</p>

        {/* Categories Tab selector */}
        <div className={styles.tabs}>
          <Link 
            href="/resources" 
            className={`${styles.tabLink} ${!type ? styles.tabLinkActive : ''}`}
          >
            All Resources
          </Link>
          <Link 
            href="/resources?type=INTERVIEW_QUESTION" 
            className={`${styles.tabLink} ${type === 'INTERVIEW_QUESTION' ? styles.tabLinkActive : ''}`}
          >
            Interview Questions
          </Link>
          <Link 
            href="/resources?type=PLACEMENT_PAPER" 
            className={`${styles.tabLink} ${type === 'PLACEMENT_PAPER' ? styles.tabLinkActive : ''}`}
          >
            Placement Papers
          </Link>
        </div>

        {/* Resources Grid */}
        <ResourceList resources={resources} />
      </div>
    </main>
  );
}

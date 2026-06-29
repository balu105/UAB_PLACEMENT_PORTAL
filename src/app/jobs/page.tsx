import React from 'react';
import Link from 'next/link';
import SearchFilters from '@/components/SearchFilters';
import JobsList from './JobsList';
import { prisma } from '@/lib/db';
import styles from './page.module.css';

interface SearchParams {
  q?: string;
  category?: string;
  type?: string;
  location?: string;
  verified?: string;
  saved?: string;
  ids?: string;
  page?: string;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const category = resolvedParams.category || '';
  const type = resolvedParams.type || '';
  const location = resolvedParams.location || '';
  const verifiedOnly = resolvedParams.verified === 'true';
  const savedOnly = resolvedParams.saved === 'true';
  const ids = resolvedParams.ids || '';
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 12; // 12 items for clean 3x4 grids on laptop screens
  const skip = (page - 1) * limit;

  // Build prisma search conditions
  const whereClause: any = {
    status: 'PUBLISHED',
  };

  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { skills: { contains: q } },
    ];
  }

  if (category) {
    whereClause.category = {
      slug: category,
    };
  }

  if (type) {
    whereClause.type = type;
  }

  if (location) {
    whereClause.location = { contains: location };
  }

  if (verifiedOnly) {
    whereClause.verifiedSource = true;
  }

  if (savedOnly) {
    if (!ids || ids === 'none') {
      whereClause.id = { in: [] };
    } else {
      whereClause.id = { in: ids.split(',') };
    }
  }

  const [jobs, totalCount] = await prisma.$transaction([
    prisma.job.findMany({
      where: whereClause,
      include: {
        company: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.job.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <main className={styles.main}>
      <div className="container">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent} aria-current="page">Explore Jobs</span>
        </nav>

        {/* Page Header */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            Explore Verified <span className="gradient-text">Career Opportunities</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Browse latest hiring updates collected directly from corporate portals. Apply securely on official career pages.
          </p>
        </header>

        {/* Layout Grid */}
        <div className={styles.layout}>
          <SearchFilters />
          
          <JobsList
            jobs={jobs}
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
          />
        </div>
      </div>
    </main>
  );
}

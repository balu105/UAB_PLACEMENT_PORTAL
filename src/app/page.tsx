import React from 'react';
import Link from 'next/link';
import { ArrowRight, Building, Sparkles, Code, Cpu, Layout } from 'lucide-react';
import { prisma } from '@/lib/db';
import FeaturedJobs from './FeaturedJobs';
import AdBanner from '@/components/AdBanner';
import styles from './page.module.css';

export default async function HomePage() {
  // Query KPIs and metadata in a transaction
  const [
    jobCount,
    companyCount,
    candidateCount,
    clickCount,
    categories,
    featuredJobs,
    partners,
  ] = await prisma.$transaction([
    prisma.job.count({ where: { status: 'PUBLISHED' } }),
    prisma.company.count(),
    prisma.user.count({ where: { role: 'CANDIDATE' } }),
    prisma.jobClick.count(),
    prisma.category.findMany({
      include: {
        _count: {
          select: { jobs: { where: { status: 'PUBLISHED' } } },
        },
      },
      take: 4,
    }),
    prisma.job.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      include: { company: true },
      take: 4,
    }),
    prisma.company.findMany({
      where: { verified: true },
      take: 5,
    }),
  ]);

  return (
    <main className={styles.main}>
      {/* 1. Hero Section */}
      <section className={styles.hero}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <span className={styles.heroTag}>VERIFIED JOBS DIRECT FROM OFFICIAL SITES</span>
          <h1 className={styles.heroTitle}>
            Discover Verified jobs & <span className="gradient-text">Launch your Career</span>
          </h1>
          <p className={styles.heroSubtitle}>
            We collect, index and verify job postings directly from company career pages. Zero spam, zero third-party brokers.
          </p>

          <form action="/jobs" method="GET" className={styles.heroSearch}>
            <input
              type="text"
              name="q"
              placeholder="Search job titles, technical skills or locations..."
              className={styles.heroInput}
              required
            />
            <button type="submit" className={styles.heroBtn}>
              Find Jobs <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      <div className="container">
        {/* 2. Platform Stats Banner */}
        <section className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{jobCount}+</span>
            <span className={styles.statLabel}>Active Jobs</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{companyCount}+</span>
            <span className={styles.statLabel}>Official Companies</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{candidateCount}+</span>
            <span className={styles.statLabel}>Candidates</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{clickCount}+</span>
            <span className={styles.statLabel}>External Redirects</span>
          </div>
        </section>

        {/* 3. Horizontal Banner Ad Slot */}
        <div style={{ marginBottom: '48px' }}>
          <AdBanner placement="BANNER" />
        </div>

        {/* 4. Main Full-Width Content Sections */}
        <div className={styles.sectionsContainer}>
          
          {/* Featured Jobs List (Full Width across entire screen container) */}
          <section className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>
              <span>Featured Career Updates</span>
              <Link href="/jobs" className={styles.viewAllLink}>View all jobs</Link>
            </h2>
            <FeaturedJobs jobs={featuredJobs} />
          </section>

          {/* Categories Browse */}
          <section className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>
              <span>Browse by Category</span>
              <Link href="/jobs" className={styles.viewAllLink}>See all</Link>
            </h2>
            <div className={styles.catGrid}>
              {categories.map((cat, idx) => (
                <Link href={`/jobs?category=${cat.slug}`} key={cat.id} className={styles.catCard}>
                  <div className={styles.catIcon}>
                    {idx === 0 ? <Code size={20} /> : idx === 1 ? <Cpu size={20} /> : idx === 2 ? <Layout size={20} /> : <Sparkles size={20} />}
                  </div>
                  <span className={styles.catName}>{cat.name}</span>
                  <span className={styles.catCount}>{cat._count.jobs} open roles</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Partner Logos */}
          <section className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Verified Enterprise Partners</h2>
            <div className={styles.companiesRow}>
              {partners.map((c) => (
                <Link href={`/jobs?q=${encodeURIComponent(c.name)}`} key={c.id} className={styles.companyLogoItem}>
                  <Building size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {c.name}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

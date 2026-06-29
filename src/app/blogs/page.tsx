import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/db';
import styles from './page.module.css';

export default async function BlogsPage() {
  // Fetch published blog articles
  const blogs = await prisma.blog.findMany({
    where: {
      status: 'PUBLISHED',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className={styles.main}>
      <div className="container">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent} aria-current="page">Blog</span>
        </nav>

        <h1 className={styles.title}>Career Insights & Platform Updates</h1>
        <p className={styles.subtitle}>Stay updated with the latest hiring trends, ATS optimization guides, and system feature updates.</p>

        {blogs.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No articles published yet</h3>
            <p>Check back later for new career guides!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {blogs.map((blog) => (
              <article key={blog.id} className={styles.card}>
                <div className={styles.coverContainer}>
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className={styles.cover}
                    />
                  ) : (
                    <div className={styles.cover} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
                      No cover image
                    </div>
                  )}
                </div>

                <div className={styles.body}>
                  <span className={styles.date}>
                    {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft'}
                  </span>
                  
                  <h2 className={styles.cardTitle}>{blog.title}</h2>
                  
                  <p className={styles.excerpt}>{blog.excerpt}</p>
                  
                  <Link href={`/blogs/${blog.slug}`} className={styles.readMore}>
                    Read Article <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

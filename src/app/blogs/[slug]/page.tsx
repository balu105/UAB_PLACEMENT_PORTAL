import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch Blog post
  const blog = await prisma.blog.findUnique({
    where: { slug },
  });

  if (!blog || blog.status !== 'PUBLISHED') {
    notFound();
  }

  // 2. Construct Article Structured Schema (Google Article Schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': blog.title,
    'description': blog.excerpt || undefined,
    'image': blog.coverImage || undefined,
    'datePublished': blog.publishedAt ? blog.publishedAt.toISOString() : blog.createdAt.toISOString(),
    'dateModified': blog.updatedAt.toISOString(),
    'author': {
      '@type': 'Person',
      'name': 'UAB CAREER LAUNCH Editorial',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'UAB CAREER LAUNCH',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://careerlaunch.ai/favicon.ico',
      },
    },
  };

  return (
    <main className={styles.main}>
      {/* Inject Article SEO schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
          <Link href="/blogs" className={styles.breadcrumbLink}>Blog</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent} aria-current="page">{blog.title}</span>
        </nav>

        {/* Article Layout */}
        <article className={styles.articleCard}>
          {/* Header */}
          <header className={styles.header}>
            <span className={styles.meta}>
              Published on {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft'}
            </span>
            <h1 className={styles.title}>{blog.title}</h1>
            {blog.excerpt && <p className={styles.excerpt}>{blog.excerpt}</p>}
          </header>

          {/* Cover image */}
          {blog.coverImage && (
            <div className={styles.coverContainer}>
              <img
                src={blog.coverImage}
                alt={blog.title}
                className={styles.cover}
              />
            </div>
          )}

          {/* Article Text Content */}
          <div className={styles.content}>
            <div className={styles.richText}>{blog.content}</div>
          </div>
        </article>
      </div>
    </main>
  );
}

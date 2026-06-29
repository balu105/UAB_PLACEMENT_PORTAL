import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Execute queries in a transaction for maximum speed
    const [
      jobCount,
      companyCount,
      candidateCount,
      clickCount,
      subscriberCount,
      adCount,
      topJobs,
      jobClicks,
    ] = await prisma.$transaction([
      prisma.job.count(),
      prisma.company.count(),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.jobClick.count(),
      prisma.newsletterSubscriber.count({ where: { active: true } }),
      prisma.advertisement.count({ where: { active: true } }),
      prisma.job.findMany({
        take: 5,
        orderBy: { views: 'desc' },
        include: { company: true },
      }),
      prisma.jobClick.groupBy({
        by: ['jobId'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    // Build outbound click summary mapping job IDs to job titles
    const clickSummary = [];
    for (const group of jobClicks) {
      const job = await prisma.job.findUnique({
        where: { id: group.jobId },
        include: { company: true },
      });
      if (job) {
        clickSummary.push({
          title: job.title,
          company: job.company.name,
          count: (group._count as any)?.id || 0,
        });
      }
    }

    return NextResponse.json({
      kpis: {
        jobs: jobCount,
        companies: companyCount,
        candidates: candidateCount,
        clicks: clickCount,
        subscribers: subscriberCount,
        ads: adCount,
      },
      topJobs: topJobs.map(j => ({
        title: j.title,
        company: j.company.name,
        views: j.views,
      })),
      clickSummary,
    });
  } catch (error) {
    console.error('Analytics metrics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

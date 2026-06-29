import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Find jobs matching title, location, or skills
    const jobs = await prisma.job.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { location: { contains: query } },
          { skills: { contains: query } },
        ],
        status: 'PUBLISHED',
      },
      take: 5,
      include: {
        company: true,
      },
    });

    const suggestions = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      type: 'job',
      url: `/jobs/${job.slug}`,
      subtitle: `${job.company.name} • ${job.location}`,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const location = searchParams.get('location') || '';
    const verifiedOnly = searchParams.get('verified') === 'true';
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Build Prisma query filters
    const whereClause: any = {
      status: 'PUBLISHED',
    };

    if (query) {
      whereClause.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { skills: { contains: query } },
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

    // Run parallel queries to speed up execution
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

    return NextResponse.json({
      jobs,
      page,
      limit,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

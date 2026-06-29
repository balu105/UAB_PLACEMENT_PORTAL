import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { jobSchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      include: {
        company: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Admin fetch jobs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = jobSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const {
      title,
      description,
      requirements,
      applyUrl,
      verifiedSource,
      type,
      location,
      salaryRange,
      skills,
      companyId,
      categoryId,
      status,
    } = result.data;

    // Generate unique slug
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${cleanTitle}-${Date.now()}`;

    const job = await prisma.job.create({
      data: {
        title,
        slug,
        description,
        requirements,
        applyUrl,
        verifiedSource,
        type,
        location,
        salaryRange,
        skills,
        companyId,
        categoryId,
        status,
      },
    });

    // Create Admin Audit Trail Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_JOB',
        details: `Created job posting: "${title}"`,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Admin create job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

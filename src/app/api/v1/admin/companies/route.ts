import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { companySchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Admin fetch companies error:', error);
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
    const result = companySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, website, logoUrl, description, verified } = result.data;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        website,
        logoUrl,
        description,
        verified,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_COMPANY',
        details: `Created company profile: "${name}"`,
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error('Admin create company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

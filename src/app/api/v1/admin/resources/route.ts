import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { resourceSchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resources = await prisma.resource.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Admin fetch resources error:', error);
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
    const result = resourceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { title, type, content, category } = result.data;
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${cleanTitle}-${Date.now()}`;

    const resource = await prisma.resource.create({
      data: {
        title,
        slug,
        type,
        content,
        category,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_RESOURCE',
        details: `Created resource: "${title}"`,
      },
    });

    return NextResponse.json({ success: true, resource });
  } catch (error) {
    console.error('Admin create resource error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

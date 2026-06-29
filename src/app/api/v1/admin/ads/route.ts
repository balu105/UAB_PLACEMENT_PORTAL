import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { adSchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ads = await prisma.advertisement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Admin fetch ads error:', error);
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
    const result = adSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { title, placement, imageUrl, targetUrl, active } = result.data;

    const ad = await prisma.advertisement.create({
      data: {
        title,
        placement,
        imageUrl,
        targetUrl,
        active,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_AD',
        details: `Created advertisement: "${title}"`,
      },
    });

    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error('Admin create ad error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

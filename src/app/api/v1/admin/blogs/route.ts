import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { blogSchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blogs = await prisma.blog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('Admin fetch blogs error:', error);
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
    const result = blogSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { title, content, excerpt, coverImage, status } = result.data;
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${cleanTitle}-${Date.now()}`;

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_BLOG',
        details: `Created blog post: "${title}"`,
      },
    });

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error('Admin create blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

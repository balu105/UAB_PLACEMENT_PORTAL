import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { blogSchema } from '@/lib/validation';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const result = blogSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { title, content, excerpt, coverImage, status } = result.data;
    
    const originalBlog = await prisma.blog.findUnique({ where: { id } });
    if (!originalBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Set publish date if transitioned from DRAFT to PUBLISHED
    const publishedAt = originalBlog.status !== 'PUBLISHED' && status === 'PUBLISHED' 
      ? new Date() 
      : originalBlog.publishedAt;

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        title,
        content,
        excerpt,
        coverImage,
        status,
        publishedAt,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_BLOG',
        details: `Updated blog post: "${updated.title}"`,
      },
    });

    return NextResponse.json({ success: true, blog: updated });
  } catch (error) {
    console.error('Admin update blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const deleted = await prisma.blog.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_BLOG',
        details: `Deleted blog post: "${deleted.title}"`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

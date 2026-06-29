import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { adSchema } from '@/lib/validation';

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
    const result = adSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.advertisement.update({
      where: { id },
      data: result.data,
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_AD',
        details: `Updated ad: "${updated.title}"`,
      },
    });

    return NextResponse.json({ success: true, ad: updated });
  } catch (error) {
    console.error('Admin update ad error:', error);
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

    const deleted = await prisma.advertisement.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_AD',
        details: `Deleted ad: "${deleted.title}"`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete ad error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

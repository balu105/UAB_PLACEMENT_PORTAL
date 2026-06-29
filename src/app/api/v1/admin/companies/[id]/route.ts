import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { companySchema } from '@/lib/validation';

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
    const result = companySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: result.data,
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_COMPANY',
        details: `Updated company profile: "${updated.name}"`,
      },
    });

    return NextResponse.json({ success: true, company: updated });
  } catch (error) {
    console.error('Admin update company error:', error);
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

    const deleted = await prisma.company.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_COMPANY',
        details: `Deleted company profile: "${deleted.name}"`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { jobSchema } from '@/lib/validation';

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
    const result = jobSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: result.data,
    });

    // Log administrative action
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_JOB',
        details: `Updated job: "${updatedJob.title}"`,
      },
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error('Admin update job error:', error);
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
    
    const deletedJob = await prisma.job.delete({
      where: { id },
    });

    // Log administrative action
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_JOB',
        details: `Deleted job: "${deletedJob.title}"`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

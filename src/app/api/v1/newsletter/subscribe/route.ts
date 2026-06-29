import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = emailSchema.safeParse(body.email);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const email = result.data;

    // Use upsert to enable reactivation of previously deactivated emails
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email, active: true },
    });

    return NextResponse.json({ success: true, subscriber });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

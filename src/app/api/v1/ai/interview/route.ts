import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateInterviewQuestions } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skills, role } = await req.json();

    if (!skills || !role) {
      return NextResponse.json({ error: 'Skills and Role are required' }, { status: 400 });
    }

    const questions = await generateInterviewQuestions(skills, role);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Interview questions API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

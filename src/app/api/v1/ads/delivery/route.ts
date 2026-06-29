import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get('placement');
    
    if (!placement) {
      return NextResponse.json({ error: 'Placement parameter is required' }, { status: 400 });
    }

    // Find active ads matching slot placement
    const ads = await prisma.advertisement.findMany({
      where: {
        placement,
        active: true,
      },
    });

    if (ads.length === 0) {
      return NextResponse.json({ ad: null });
    }

    // Pick a random ad for delivery (Rotation)
    const ad = ads[Math.floor(Math.random() * ads.length)];

    // Increment impressions count asynchronously
    await prisma.advertisement.update({
      where: { id: ad.id },
      data: { impressions: { increment: 1 } },
    });

    return NextResponse.json({ ad });
  } catch (error) {
    console.error('Ad delivery error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

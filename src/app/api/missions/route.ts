import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const missions = await db.missionTemplate.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ missions });
  } catch (error) {
    console.error('Fetch missions error:', error);
    return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
  }
}

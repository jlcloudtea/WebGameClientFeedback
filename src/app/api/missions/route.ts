import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const missions = await db.missionTemplate.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const parsed = missions.map((m) => ({
      ...m,
      scenarioData: JSON.parse(m.scenarioData),
      scoringRubric: JSON.parse(m.scoringRubric),
    }));

    return NextResponse.json({ missions: parsed });
  } catch (error) {
    console.error('Fetch missions error:', error);
    return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
  }
}

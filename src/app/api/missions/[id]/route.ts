import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const mission = await db.missionTemplate.findUnique({ where: { id } });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    return NextResponse.json({
      mission: {
        ...mission,
        scenarioData: JSON.parse(mission.scenarioData),
        scoringRubric: JSON.parse(mission.scoringRubric),
      },
    });
  } catch (error) {
    console.error('Fetch mission error:', error);
    return NextResponse.json({ error: 'Failed to fetch mission' }, { status: 500 });
  }
}

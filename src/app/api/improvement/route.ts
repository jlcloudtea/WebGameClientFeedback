import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { playerId, roomMissionId, recommendations, actionItems } = await req.json();

    if (!playerId || !roomMissionId) {
      return NextResponse.json(
        { error: 'playerId and roomMissionId are required' },
        { status: 400 },
      );
    }

    const plan = await db.improvementPlan.create({
      data: {
        playerId,
        roomMissionId,
        recommendations: JSON.stringify(recommendations ?? []),
        actionItems: JSON.stringify(actionItems ?? []),
        overallScore: 0,
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Create improvement plan error:', error);
    return NextResponse.json({ error: 'Failed to create improvement plan' }, { status: 500 });
  }
}

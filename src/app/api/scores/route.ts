import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const XP_PER_LEVEL = 200;

export async function POST(req: NextRequest) {
  try {
    const { playerId, roomMissionId, points, breakdown, clientSatisfaction, timeTakenSec } =
      await req.json();

    if (!playerId || !roomMissionId) {
      return NextResponse.json({ error: 'playerId and roomMissionId are required' }, { status: 400 });
    }

    const score = await db.score.create({
      data: {
        playerId,
        roomMissionId,
        points: points ?? 0,
        breakdown: JSON.stringify(breakdown ?? {}),
        clientSatisfaction: clientSatisfaction ?? 0,
        timeTakenSec: timeTakenSec ?? 0,
      },
    });

    const player = await db.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const newXp = player.xp + (points ?? 0);
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

    await db.player.update({
      where: { id: playerId },
      data: { xp: newXp, level: newLevel },
    });

    return NextResponse.json({
      score,
      newXp,
      newLevel,
    });
  } catch (error) {
    console.error('Create score error:', error);
    return NextResponse.json({ error: 'Failed to create score' }, { status: 500 });
  }
}

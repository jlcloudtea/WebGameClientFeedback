import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/scores/submit
 * Solo-play score submission — creates or updates the player and records a score.
 * Does not require a RoomMission (solo mode has no room).
 */
export async function POST(req: NextRequest) {
  try {
    const {
      nickname,
      avatar,
      missionType,
      totalScore,
      xpEarned,
      empathy,
      professionalism,
      timeTakenSec,
    } = await req.json();

    if (!nickname || !missionType || totalScore === undefined) {
      return NextResponse.json(
        { error: 'nickname, missionType, and totalScore are required' },
        { status: 400 },
      );
    }

    // Upsert player by nickname
    const player = await db.player.upsert({
      where: { nickname },
      update: {
        avatar: avatar ?? 'default',
      },
      create: {
        nickname,
        avatar: avatar ?? 'default',
      },
    });

    // Create a score record (roomMissionId is null for solo play)
    await db.score.create({
      data: {
        playerId: player.id,
        roomMissionId: null,
        points: totalScore ?? 0,
        breakdown: {
          missionType,
          empathy: empathy ?? 0,
          professionalism: professionalism ?? 0,
          xpEarned: xpEarned ?? 0,
        },
        clientSatisfaction: empathy ?? 0,
        timeTakenSec: timeTakenSec ?? 0,
      },
    });

    // Update player XP and level
    const XP_PER_LEVEL = 200;
    const newXp = player.xp + (xpEarned ?? 0);
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

    await db.player.update({
      where: { id: player.id },
      data: { xp: newXp, level: newLevel },
    });

    return NextResponse.json({
      success: true,
      player: {
        id: player.id,
        nickname: player.nickname,
        xp: newXp,
        level: newLevel,
      },
    });
  } catch (error) {
    console.error('Score submit error:', error);
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
  }
}

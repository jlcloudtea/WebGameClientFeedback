import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/scores/batch
 * Batch-sync all mission scores from localStorage to the database.
 * Called once when the user visits the leaderboard or completes all missions.
 *
 * Body: {
 *   nickname, avatar, xp, level,
 *   missionScores: [{ missionType, totalScore, xpEarned, empathy, professionalism, completedAt }]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { nickname, avatar, xp, level, missionScores } = await req.json();

    if (!nickname || !Array.isArray(missionScores)) {
      return NextResponse.json(
        { error: 'nickname and missionScores[] are required' },
        { status: 400 },
      );
    }

    // Upsert player by nickname — set XP/level from client (source of truth)
    const player = await db.player.upsert({
      where: { nickname },
      update: {
        avatar: avatar ?? 'default',
        xp: xp ?? 0,
        level: level ?? 1,
      },
      create: {
        nickname,
        avatar: avatar ?? 'default',
        xp: xp ?? 0,
        level: level ?? 1,
      },
    });

    // Fetch existing scores for this player (solo mode: roomMissionId IS NULL)
    const existingScores = await db.score.findMany({
      where: {
        playerId: player.id,
        roomMissionId: null,
      },
      orderBy: { completedAt: 'asc' },
    });

    // Strategy: match by completedAt timestamp to avoid duplicates
    const existingTimestamps = new Set(
      existingScores.map((s) => {
        const bd = s.breakdown as Record<string, unknown> | null;
        return bd?.completedAt as number | undefined;
      }).filter(Boolean),
    );

    let newCount = 0;
    for (const score of missionScores) {
      // Skip if we already have this score (by completedAt timestamp)
      if (score.completedAt && existingTimestamps.has(score.completedAt)) {
        continue;
      }

      await db.score.create({
        data: {
          playerId: player.id,
          roomMissionId: null,
          points: score.totalScore ?? 0,
          breakdown: {
            missionType: score.missionType,
            empathy: score.empathy ?? 0,
            professionalism: score.professionalism ?? 0,
            xpEarned: score.xpEarned ?? 0,
            completedAt: score.completedAt,
          },
          clientSatisfaction: score.empathy ?? 0,
          timeTakenSec: 0,
        },
      });
      newCount++;
    }

    return NextResponse.json({
      success: true,
      synced: newCount,
      total: missionScores.length,
      player: {
        id: player.id,
        nickname: player.nickname,
        xp: player.xp,
        level: player.level,
      },
    });
  } catch (error) {
    console.error('Batch score sync error:', error);
    return NextResponse.json({ error: 'Failed to sync scores' }, { status: 500 });
  }
}

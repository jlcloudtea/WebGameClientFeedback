import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const roomId = req.nextUrl.searchParams.get('roomId');

    const players = await db.player.findMany({
      orderBy: { xp: 'desc' },
      take: 20,
      where: {
        scores: {
          some: {},
        },
      },
      include: {
        scores: roomId
          ? { where: { roomMission: { roomId } } }
          : true,
      },
    });

    const leaderboard = players
      .filter((p) => p.scores.length > 0)
      .map((p, i) => ({
        rank: i + 1,
        playerId: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        xp: p.xp,
        level: p.level,
        missionsCompleted: p.scores.length,
        averageScore:
          p.scores.length > 0
            ? Math.round(p.scores.reduce((sum, s) => sum + s.points, 0) / p.scores.length)
            : 0,
      }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

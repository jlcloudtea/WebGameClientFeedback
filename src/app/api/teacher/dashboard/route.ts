import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const teacherId = req.nextUrl.searchParams.get('teacherId');
    if (!teacherId) {
      return NextResponse.json({ error: 'teacherId is required' }, { status: 400 });
    }

    const teacher = await db.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get rooms created by this teacher (via sessions or all rooms for now)
    const rooms = await db.room.findMany({
      include: {
        players: { include: { player: true } },
        missions: {
          include: {
            missionTemplate: true,
            scores: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate stats
    const totalStudents = new Set(rooms.flatMap((r) => r.players.map((p) => p.playerId))).size;
    const totalScores = rooms.flatMap((r) => r.missions.flatMap((m) => m.scores));
    const completedMissions = rooms.flatMap((r) => r.missions).filter((m) => m.status === 'COMPLETED');
    const completionRate =
      rooms.flatMap((r) => r.missions).length > 0
        ? Math.round(
            (completedMissions.length /
              rooms.flatMap((r) => r.missions).length) *
              100,
          )
        : 0;
    const averageScore =
      totalScores.length > 0
        ? Math.round(totalScores.reduce((sum, s) => sum + s.points, 0) / totalScores.length)
        : 0;

    const roomSummaries = rooms.map((room) => ({
      id: room.id,
      code: room.code,
      name: room.name,
      status: room.status,
      playerCount: room.players.length,
      missions: room.missions.map((m) => ({
        id: m.id,
        status: m.status,
        title: m.missionTemplate.title,
        type: m.missionTemplate.type,
        scores: m.scores.map((s) => ({ playerId: s.playerId, points: s.points })),
      })),
    }));

    return NextResponse.json({
      rooms: roomSummaries,
      stats: {
        totalRooms: rooms.length,
        totalStudents,
        totalMissionsCompleted: completedMissions.length,
        completionRate,
        averageScore,
      },
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}

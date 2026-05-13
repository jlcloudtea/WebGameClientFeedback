import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/admin/cleanup
 * Deletes scores and orphaned players older than 7 days.
 * Intended to be called by a cron service (e.g. cron-job.org).
 *
 * Security: requires CRON_SECRET env var to match the `secret` query param.
 * Usage: POST /api/admin/cleanup?secret=YOUR_CRON_SECRET
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const secret = req.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured on server' },
        { status: 500 },
      );
    }

    if (secret !== cronSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 },
      );
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Delete old scores (solo play: roomMissionId IS NULL)
    const deletedScores = await db.score.deleteMany({
      where: {
        completedAt: { lt: sevenDaysAgo },
        roomMissionId: null,
      },
    });

    // Delete players who have no remaining scores and no room activity
    const playersWithScores = await db.player.findMany({
      where: { scores: { some: {} } },
      select: { id: true },
    });
    const playersWithRooms = await db.player.findMany({
      where: { roomPlayers: { some: {} } },
      select: { id: true },
    });
    const activePlayerIds = new Set([
      ...playersWithScores.map((p) => p.id),
      ...playersWithRooms.map((p) => p.id),
    ]);

    // Find orphaned players (no scores, no room activity)
    const allPlayers = await db.player.findMany({
      select: { id: true },
    });
    const orphanedIds = allPlayers
      .map((p) => p.id)
      .filter((id) => !activePlayerIds.has(id));

    let deletedPlayers = 0;
    if (orphanedIds.length > 0) {
      // Delete related records first (cascade should handle this, but be explicit)
      await db.playerBadge.deleteMany({
        where: { playerId: { in: orphanedIds } },
      });
      const deleteResult = await db.player.deleteMany({
        where: { id: { in: orphanedIds } },
      });
      deletedPlayers = deleteResult.count;
    }

    return NextResponse.json({
      success: true,
      cutoff: sevenDaysAgo.toISOString(),
      deletedScores: deletedScores.count,
      deletedPlayers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}

/**
 * GET /api/admin/cleanup?secret=XXX
 * Dry-run: returns what WOULD be deleted without actually deleting.
 */
export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured on server' },
        { status: 500 },
      );
    }

    if (secret !== cronSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 },
      );
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const oldScores = await db.score.count({
      where: {
        completedAt: { lt: sevenDaysAgo },
        roomMissionId: null,
      },
    });

    return NextResponse.json({
      dryRun: true,
      cutoff: sevenDaysAgo.toISOString(),
      oldScoresThatWouldBeDeleted: oldScores,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cleanup dry-run error:', error);
    return NextResponse.json({ error: 'Cleanup check failed' }, { status: 500 });
  }
}

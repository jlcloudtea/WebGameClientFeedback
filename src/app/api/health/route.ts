import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/health
 * Health check endpoint — verifies database connectivity and returns system status.
 * Can be used by cron-job.org or uptime monitors.
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latencyMs?: number; detail?: string }> = {};

  // 1. Database connectivity
  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'ok',
      latencyMs: Date.now() - dbStart,
    };
  } catch (err) {
    checks.database = {
      status: 'error',
      detail: err instanceof Error ? err.message : 'Unknown DB error',
    };
  }

  // 2. Player count
  try {
    const playerCount = await db.player.count();
    checks.players = {
      status: 'ok',
      detail: `${playerCount} players`,
    };
  } catch {
    checks.players = { status: 'error' };
  }

  // 3. Score count
  try {
    const scoreCount = await db.score.count();
    checks.scores = {
      status: 'ok',
      detail: `${scoreCount} scores`,
    };
  } catch {
    checks.scores = { status: 'error' };
  }

  // 4. Mission templates
  try {
    const missionCount = await db.missionTemplate.count();
    checks.missions = {
      status: 'ok',
      detail: `${missionCount} templates`,
    };
  } catch {
    checks.missions = { status: 'error' };
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  const totalLatency = Date.now() - startTime;

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      version: '1.0.0',
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : undefined,
      latencyMs: totalLatency,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 },
  );
}

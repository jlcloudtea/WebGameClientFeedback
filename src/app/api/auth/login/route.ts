import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { nickname, avatar } = await req.json();

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json({ error: 'Nickname is required' }, { status: 400 });
    }

    const player = await db.player.upsert({
      where: { nickname },
      update: { avatar: avatar ?? 'default' },
      create: {
        nickname,
        avatar: avatar ?? 'default',
      },
    });

    return NextResponse.json({
      player: {
        id: player.id,
        nickname: player.nickname,
        avatar: player.avatar,
        xp: player.xp,
        level: player.level,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

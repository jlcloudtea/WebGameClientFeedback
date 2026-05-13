import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { nickname, passcode } = await req.json();

    if (!nickname || !passcode) {
      return NextResponse.json(
        { error: 'Nickname and passcode are required' },
        { status: 400 },
      );
    }

    const teacher = await db.teacher.findFirst({
      where: { nickname, passcode },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create an active session
    await db.teacherSession.create({
      data: { teacherId: teacher.id },
    });

    return NextResponse.json({ teacher });
  } catch (error) {
    console.error('Teacher login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

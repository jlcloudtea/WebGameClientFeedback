import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface QuestionDraft {
  type: string;
  text: string;
  required?: boolean;
  options?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { roomMissionId, playerId, title, description, questions } = await req.json();

    if (!roomMissionId || !playerId || !title) {
      return NextResponse.json(
        { error: 'roomMissionId, playerId, and title are required' },
        { status: 400 },
      );
    }

    const survey = await db.survey.create({
      data: {
        roomMissionId,
        playerId,
        title,
        description: description ?? '',
        questions: {
          create: (questions as QuestionDraft[]).map((q, i) => ({
            order: i,
            type: q.type,
            text: q.text,
            options: q.options ?? [],
            required: q.required ?? true,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({ survey });
  } catch (error) {
    console.error('Create survey error:', error);
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
  }
}

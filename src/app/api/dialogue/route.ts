import { NextRequest, NextResponse } from 'next/server';
import { DIALOGUE_SYSTEM_PROMPT } from '@/lib/ai-prompts';

const FALLBACK_RESPONSE = {
  clientResponse:
    "I appreciate you asking. Let me think about that for a moment... Yes, I think we need something that handles our current workload but can also scale as we grow. Does that make sense?",
  emotion: 'neutral',
  satisfactionDelta: 1,
  feedback: 'Good engagement. Try asking more specific follow-up questions to uncover hidden needs.',
};

export async function POST(req: NextRequest) {
  try {
    const { missionType, clientProfile, messageHistory, playerMessage } = await req.json();

    if (!playerMessage) {
      return NextResponse.json({ error: 'playerMessage is required' }, { status: 400 });
    }

    const contextPrompt = [
      `Mission type: ${missionType || 'customer-interview'}`,
      clientProfile ? `Client profile: ${JSON.stringify(clientProfile)}` : '',
      `You are now responding to the student's message: "${playerMessage}"`,
    ]
      .filter(Boolean)
      .join('\n');

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { zai } = require('z-ai-web-dev-sdk') as { zai: typeof import('z-ai-web-dev-sdk').zai };

    const messages = [
      { role: 'system' as const, content: `${DIALOGUE_SYSTEM_PROMPT}\n\n${contextPrompt}` },
      ...(Array.isArray(messageHistory) ? messageHistory : []),
      { role: 'user' as const, content: playerMessage },
    ];

    const response = await zai.chat.completions.create({
      model: 'glm-4-flash',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiText = response.choices[0]?.message?.content || '';

    // Try to parse structured JSON from AI response
    let parsed: Record<string, unknown> = {};
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // AI didn't return valid JSON — use text as-is
    }

    return NextResponse.json({
      clientResponse: (parsed.message as string) || aiText,
      emotion: (parsed.emotion as string) || 'neutral',
      satisfactionDelta: (parsed.satisfactionDelta as number) ?? 0,
      revealedNeed: (parsed.revealedNeed as string) || null,
      feedback: (parsed.feedback as string) || '',
    });
  } catch (error) {
    console.error('Dialogue AI error, using fallback:', error);
    return NextResponse.json(FALLBACK_RESPONSE);
  }
}

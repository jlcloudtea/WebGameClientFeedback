import { NextRequest, NextResponse } from 'next/server';

const POSITIVE_WORDS = ['great', 'excellent', 'happy', 'satisfied', 'love', 'amazing', 'good', 'fast', 'helpful', 'professional', 'reliable', 'easy'];
const NEGATIVE_WORDS = ['bad', 'terrible', 'slow', 'frustrated', 'angry', 'broken', 'unreliable', 'difficult', 'poor', 'hate', 'awful', 'delay', 'problem', 'issue', 'complaint'];
const CATEGORIES = ['performance', 'reliability', 'usability', 'support', 'cost', 'security'];

function fallbackAnalyze(texts: string[]) {
  return texts.map((text) => {
    const lower = text.toLowerCase();
    const posHits = POSITIVE_WORDS.filter((w) => lower.includes(w)).length;
    const negHits = NEGATIVE_WORDS.filter((w) => lower.includes(w)).length;

    const sentiment = negHits > posHits ? 'negative' : posHits > negHits ? 'positive' : 'neutral';
    const suggestedCategory = CATEGORIES.find((c) => lower.includes(c)) || 'general';
    const keyThemes = [...new Set([...POSITIVE_WORDS, ...NEGATIVE_WORDS].filter((w) => lower.includes(w)))].slice(0, 3);

    return { text, sentiment, suggestedCategory, keyThemes };
  });
}

export async function POST(req: NextRequest) {
  try {
    const { feedbackTexts } = await req.json();

    if (!Array.isArray(feedbackTexts) || feedbackTexts.length === 0) {
      return NextResponse.json({ error: 'feedbackTexts array is required' }, { status: 400 });
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { zai } = require('z-ai-web-dev-sdk') as { zai: typeof import('z-ai-web-dev-sdk').zai };

      const prompt = `Analyse each feedback item. Return a JSON array where each element has: { "text": "original text", "sentiment": "positive|negative|neutral", "suggestedCategory": "one of: performance,reliability,usability,support,cost,security,general", "keyThemes": ["theme1","theme2"] }

Feedback items:
${feedbackTexts.map((t: string, i: number) => `${i + 1}. "${t}"`).join('\n')}`;

      const response = await zai.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: 'You are a feedback analysis assistant. Return only valid JSON arrays.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const aiText = response.choices[0]?.message?.content || '';
      const jsonMatch = aiText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const results = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ results });
      }
    } catch (aiError) {
      console.error('Feedback AI error, using fallback:', aiError);
    }

    // Fallback: simple keyword-based analysis
    const results = fallbackAnalyze(feedbackTexts);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Feedback analyze error:', error);
    return NextResponse.json({ error: 'Failed to analyze feedback' }, { status: 500 });
  }
}

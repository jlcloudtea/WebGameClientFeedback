import { NextRequest, NextResponse } from 'next/server';

interface QuestionDraft {
  type: string;
  text: string;
  required?: boolean;
  options?: string[];
}

const BIASED_PHRASES = [
  "don't you agree",
  "isn't it",
  'obviously',
  'clearly',
  "wouldn't you say",
  'everyone knows',
  'surely',
];

const KEY_AREAS = ['technical', 'business', 'user', 'budget', 'timeline', 'security'];

function evaluateSurvey(questions: QuestionDraft[]): {
  score: number;
  feedback: string;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 0;

  // 1. Question count (5-10 is ideal)
  const count = questions.length;
  if (count < 3) {
    score += 10;
    suggestions.push('Add more questions — at least 5 are recommended for a thorough survey.');
  } else if (count < 5) {
    score += 20;
    suggestions.push('Consider adding a few more questions (5-10 is the sweet spot).');
  } else if (count <= 10) {
    score += 35;
  } else if (count <= 15) {
    score += 25;
    suggestions.push('Your survey is quite long. Consider trimming to 10 questions for better response rates.');
  } else {
    score += 15;
    suggestions.push('Survey is too long — respondents may drop off. Aim for 5-10 questions.');
  }

  // 2. Quantitative vs qualitative balance
  const quantCount = questions.filter((q) => q.type.startsWith('quantitative')).length;
  const qualCount = questions.filter((q) => q.type.startsWith('qualitative')).length;
  if (quantCount > 0 && qualCount > 0) {
    const ratio = Math.min(quantCount, qualCount) / Math.max(quantCount, qualCount);
    score += Math.round(20 * ratio);
  } else {
    score += 5;
    suggestions.push('Include both quantitative (ratings, scales) and qualitative (open-ended) questions.');
  }

  // 3. Biased wording check
  const biasedQuestions = questions.filter((q) =>
    BIASED_PHRASES.some((phrase) => q.text.toLowerCase().includes(phrase)),
  );
  if (biasedQuestions.length === 0) {
    score += 20;
  } else {
    score += Math.max(0, 20 - biasedQuestions.length * 7);
    suggestions.push(
      `Rephrase ${biasedQuestions.length} question(s) to remove biased or leading wording.`,
    );
  }

  // 4. Coverage of key areas (simple keyword heuristic)
  const allText = questions.map((q) => q.text.toLowerCase()).join(' ');
  const coveredAreas = KEY_AREAS.filter((area) => allText.includes(area));
  const coverageRatio = coveredAreas.length / KEY_AREAS.length;
  score += Math.round(25 * coverageRatio);
  if (coverageRatio < 0.5) {
    suggestions.push(
      'Your survey may miss key areas. Consider covering: technical, business, user, budget, timeline, and security.',
    );
  }

  const feedback =
    score >= 80
      ? 'Excellent survey design! Good balance, coverage, and unbiased wording.'
      : score >= 60
        ? 'Good effort! A few adjustments could make this survey more effective.'
        : score >= 40
          ? 'Decent start. Focus on adding more questions, improving balance, and checking for bias.'
          : 'Needs improvement. Review the suggestions below to strengthen your survey.';

  return { score: Math.min(100, score), feedback, suggestions };
}

export async function POST(req: NextRequest) {
  try {
    const { questions } = await req.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'questions array is required' },
        { status: 400 },
      );
    }

    const result = evaluateSurvey(questions);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Survey evaluate error:', error);
    return NextResponse.json({ error: 'Failed to evaluate survey' }, { status: 500 });
  }
}

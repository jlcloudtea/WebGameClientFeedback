// ============================================================
// ICT Support Pro — Scoring Functions
// ============================================================

import type { MissionType, MissionScore, SurveyDraft, FeedbackItem } from './stores/types';

// --- Base Score Calculation Helpers ---

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function average(...values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// --- Survey Builder Scoring ---

interface SurveyScoringInput {
  draft: SurveyDraft;
  targetQuestionCount: number;
  requiredCategories: string[];
}

export function scoreSurveyBuilder(input: SurveyScoringInput): Omit<MissionScore, 'missionId' | 'missionType' | 'completedAt'> {
  const { draft, targetQuestionCount } = input;
  const questions = draft.questions;

  // Coverage: how close to target question count
  const coverageScore = clamp(
    (questions.length / Math.max(targetQuestionCount, 1)) * 100,
    0,
    100,
  );

  // Type mix: reward having both quantitative and qualitative questions
  const quantCount = questions.filter((q) =>
    q.type.startsWith('quantitative'),
  ).length;
  const qualCount = questions.filter((q) =>
    q.type.startsWith('qualitative'),
  ).length;
  const hasBoth = quantCount > 0 && qualCount > 0;
  const typeMixScore = hasBoth
    ? clamp(50 + (Math.min(quantCount, qualCount) / Math.max(quantCount, qualCount, 1)) * 50, 0, 100)
    : quantCount > 0 || qualCount > 0
      ? 40
      : 0;

  // Question quality: non-empty text, required flags set appropriately
  const filledQuestions = questions.filter((q) => q.text.trim().length > 0);
  const qualityScore = questions.length > 0
    ? (filledQuestions.length / questions.length) * 100
    : 0;

  // Professionalism: title and description filled
  const professionalismScore = clamp(
    (draft.title.trim() ? 50 : 0) + (draft.description.trim() ? 50 : 0),
    0,
    100,
  );

  // Communication (overall flow — based on question ordering variety)
  const communicationScore = typeMixScore;

  const totalScore = Math.round(
    average(coverageScore, typeMixScore, qualityScore, professionalismScore, communicationScore),
  );
  const xpEarned = Math.round(totalScore * 0.8);

  return {
    totalScore,
    empathy: Math.round(professionalismScore),
    professionalism: Math.round(professionalismScore),
    accuracy: Math.round(qualityScore),
    communication: Math.round(communicationScore),
    timeBonus: 0,
    xpEarned,
  };
}

// --- Customer Interview / Difficult Client Scoring ---

interface DialogueScoringInput {
  empathyScores: number[];
  professionalismScores: number[];
  clientSatisfaction: number;    // 0-100
  revealedNeedsCount: number;
  totalNeedsCount: number;
  timeRemaining: number;         // seconds
  totalTime: number;             // seconds
}

export function scoreDialogueMission(
  missionType: MissionType,
  input: DialogueScoringInput,
): Omit<MissionScore, 'missionId' | 'missionType' | 'completedAt'> {
  const {
    empathyScores,
    professionalismScores,
    clientSatisfaction,
    revealedNeedsCount,
    totalNeedsCount,
    timeRemaining,
    totalTime,
  } = input;

  const avgEmpathy = average(...empathyScores) * 100;
  const avgProfessionalism = average(...professionalismScores) * 100;

  // Need discovery ratio
  const needDiscovery = totalNeedsCount > 0
    ? (revealedNeedsCount / totalNeedsCount) * 100
    : 100;

  // Communication combines empathy + satisfaction
  const communication = average(avgEmpathy, clientSatisfaction);

  // Accuracy based on needs revealed
  const accuracy = needDiscovery;

  // Time bonus: proportion of time remaining * 50 (max 50 points)
  const timeBonus = totalTime > 0 ? Math.round((timeRemaining / totalTime) * 50) : 0;

  // Weight varies by mission type
  const isDifficult = missionType === 'difficult-client';
  const totalScore = Math.round(
    isDifficult
      ? average(avgEmpathy * 1.2, avgProfessionalism * 1.1, clientSatisfaction, accuracy * 0.9) + timeBonus * 0.5
      : average(avgEmpathy, avgProfessionalism, clientSatisfaction * 0.8, accuracy * 1.2) + timeBonus * 0.5,
  );
  const xpEarned = Math.round(clamp(totalScore, 0, 100) * (isDifficult ? 1.5 : 1.2));

  return {
    totalScore: clamp(Math.round(totalScore), 0, 100),
    empathy: Math.round(clamp(avgEmpathy, 0, 100)),
    professionalism: Math.round(clamp(avgProfessionalism, 0, 100)),
    accuracy: Math.round(clamp(accuracy, 0, 100)),
    communication: Math.round(clamp(communication, 0, 100)),
    timeBonus: clamp(timeBonus, 0, 100),
    xpEarned,
  };
}

// --- Feedback Analysis Scoring ---

interface FeedbackScoringInput {
  items: FeedbackItem[];
  categorized: Record<string, string>;
  correctCategories: Record<string, string>;
  analysisNotes: string;
  timeRemaining: number;
  totalTime: number;
}

export function scoreFeedbackAnalysis(
  input: FeedbackScoringInput,
): Omit<MissionScore, 'missionId' | 'missionType' | 'completedAt'> {
  const { items, categorized, correctCategories, analysisNotes, timeRemaining, totalTime } = input;

  // Categorisation accuracy
  let correct = 0;
  let attempted = 0;
  for (const itemId of Object.keys(categorized)) {
    attempted += 1;
    if (correctCategories[itemId] === categorized[itemId]) {
      correct += 1;
    }
  }
  const accuracyScore = attempted > 0 ? (correct / attempted) * 100 : 0;

  // Coverage: percentage of items categorised
  const coverageScore = items.length > 0
    ? (Object.keys(categorized).length / items.length) * 100
    : 0;

  // Analysis quality: notes length and substance
  const noteLength = analysisNotes.trim().length;
  const analysisScore = clamp(
    noteLength === 0 ? 0 : noteLength < 50 ? 30 : noteLength < 150 ? 60 : 90,
    0,
    100,
  );

  // Professionalism from accuracy
  const professionalism = accuracyScore;

  // Time bonus
  const timeBonus = totalTime > 0 ? Math.round((timeRemaining / totalTime) * 50) : 0;

  const totalScore = Math.round(
    average(accuracyScore * 1.3, coverageScore, analysisScore, professionalism * 0.8) + timeBonus * 0.4,
  );
  const xpEarned = Math.round(clamp(totalScore, 0, 100));

  return {
    totalScore: clamp(totalScore, 0, 100),
    empathy: Math.round(clamp(coverageScore, 0, 100)),
    professionalism: Math.round(clamp(professionalism, 0, 100)),
    accuracy: Math.round(clamp(accuracyScore, 0, 100)),
    communication: Math.round(clamp(analysisScore, 0, 100)),
    timeBonus: clamp(timeBonus, 0, 100),
    xpEarned,
  };
}

// --- Service Improvement Scoring ---

interface ImprovementScoringInput {
  recommendationsCount: number;
  approvedCount: number;
  actionItemsCount: number;
  highImpactCount: number;
  lowEffortHighImpactCount: number;
  totalFeedbackItems: number;
  timeRemaining: number;
  totalTime: number;
}

export function scoreServiceImprovement(
  input: ImprovementScoringInput,
): Omit<MissionScore, 'missionId' | 'missionType' | 'completedAt'> {
  const {
    recommendationsCount,
    approvedCount,
    actionItemsCount,
    highImpactCount,
    lowEffortHighImpactCount,
    totalFeedbackItems,
    timeRemaining,
    totalTime,
  } = input;

  // Coverage: recommendations relative to feedback volume
  const coverageScore = totalFeedbackItems > 0
    ? clamp((recommendationsCount / Math.ceil(totalFeedbackItems / 3)) * 100, 0, 100)
    : recommendationsCount > 0 ? 60 : 0;

  // Quality: approved ratio + quick wins identified
  const approvalRate = recommendationsCount > 0
    ? (approvedCount / recommendationsCount) * 100
    : 0;
  const quickWinBonus = lowEffortHighImpactCount > 0 ? 20 : 0;
  const qualityScore = clamp(approvalRate * 0.6 + quickWinBonus + (highImpactCount > 0 ? 20 : 0), 0, 100);

  // Actionability: action items per recommendation
  const actionabilityScore = recommendationsCount > 0
    ? clamp((actionItemsCount / recommendationsCount) * 50, 0, 100)
    : 0;

  // Professionalism from approval rate
  const professionalism = approvalRate;

  // Time bonus
  const timeBonus = totalTime > 0 ? Math.round((timeRemaining / totalTime) * 50) : 0;

  const totalScore = Math.round(
    average(coverageScore, qualityScore * 1.2, actionabilityScore, professionalism * 0.8) + timeBonus * 0.4,
  );
  const xpEarned = Math.round(clamp(totalScore, 0, 100) * 1.3);

  return {
    totalScore: clamp(totalScore, 0, 100),
    empathy: Math.round(clamp(coverageScore, 0, 100)),
    professionalism: Math.round(clamp(professionalism, 0, 100)),
    accuracy: Math.round(clamp(qualityScore, 0, 100)),
    communication: Math.round(clamp(actionabilityScore, 0, 100)),
    timeBonus: clamp(timeBonus, 0, 100),
    xpEarned,
  };
}

// --- General: compute MissionScore from partial ---

export function createMissionScore(
  missionId: string,
  missionType: MissionType,
  partial: Omit<MissionScore, 'missionId' | 'missionType' | 'completedAt'>,
): MissionScore {
  return {
    missionId,
    missionType,
    ...partial,
    completedAt: Date.now(),
  };
}

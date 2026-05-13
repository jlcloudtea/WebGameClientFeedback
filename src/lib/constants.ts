// ============================================================
// ICT Support Pro — Game Constants
// ============================================================

import type { MissionType, SurveyQuestionType } from './stores/types';

// --- XP & Levelling ---

export const XP_PER_LEVEL = 200;

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Trainee',
  2: 'Junior Consultant',
  3: 'Consultant',
  4: 'Senior Consultant',
  5: 'Lead Consultant',
  6: 'Principal Consultant',
  7: 'Expert',
  8: 'Master',
  9: 'Champion',
  10: 'Legend',
};

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, 10)] ?? 'Legend';
}

// --- Mission Types ---

export interface MissionTypeDef {
  id: MissionType;
  title: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  color: string;        // Tailwind colour class for accent
  estimatedMinutes: number;
  xpReward: number;
}

export const MISSION_TYPES: MissionTypeDef[] = [
  {
    id: 'survey-builder',
    title: 'Survey Builder',
    description:
      'Design a professional survey to gather client requirements. Choose question types, write clear items, and evaluate completeness.',
    icon: '📋',
    difficulty: 'beginner',
    color: 'text-emerald-600',
    estimatedMinutes: 15,
    xpReward: 80,
  },
  {
    id: 'customer-interview',
    title: 'Customer Interview',
    description:
      'Conduct a one-on-one interview with a client. Use active listening and appropriate questioning techniques to uncover hidden needs.',
    icon: '🗣️',
    difficulty: 'intermediate',
    color: 'text-amber-600',
    estimatedMinutes: 20,
    xpReward: 120,
  },
  {
    id: 'feedback-analysis',
    title: 'Feedback Analysis',
    description:
      'Analyse client feedback data, categorise comments, identify patterns, and write actionable insights.',
    icon: '📊',
    difficulty: 'intermediate',
    color: 'text-violet-600',
    estimatedMinutes: 18,
    xpReward: 100,
  },
  {
    id: 'difficult-client',
    title: 'Difficult Client',
    description:
      'Handle a challenging client interaction. Manage emotions, de-escalate tension, and maintain professionalism throughout.',
    icon: '🔥',
    difficulty: 'advanced',
    color: 'text-rose-600',
    estimatedMinutes: 25,
    xpReward: 150,
  },
  {
    id: 'service-improvement',
    title: 'Service Improvement',
    description:
      'Review service performance data, generate improvement recommendations, and create an action plan with clear priorities.',
    icon: '🚀',
    difficulty: 'advanced',
    color: 'text-sky-600',
    estimatedMinutes: 22,
    xpReward: 130,
  },
];

// --- Survey Question Type Palette ---

export interface QuestionTypePaletteItem {
  type: SurveyQuestionType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const SURVEY_QUESTION_TYPES: QuestionTypePaletteItem[] = [
  {
    type: 'quantitative-rating',
    label: 'Star Rating',
    description: 'Rate on a 1-5 star scale',
    icon: '⭐',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    type: 'quantitative-multiple',
    label: 'Multiple Choice',
    description: 'Select one from a list',
    icon: '🔘',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    type: 'quantitative-scale',
    label: 'Likert Scale',
    description: 'Agree/disagree on a scale',
    icon: '📏',
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    type: 'qualitative-open',
    label: 'Open-ended',
    description: 'Free-text response',
    icon: '✍️',
    color: 'bg-green-100 text-green-800',
  },
  {
    type: 'qualitative-yesno',
    label: 'Yes / No',
    description: 'Binary yes or no answer',
    icon: '✅',
    color: 'bg-teal-100 text-teal-800',
  },
];

// --- Badge Definitions ---

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  xpBonus: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-mission',
    title: 'First Steps',
    description: 'Complete your first mission',
    icon: '🏅',
    condition: 'Complete 1 mission',
    xpBonus: 25,
  },
  {
    id: 'survey-master',
    title: 'Survey Master',
    description: 'Complete all survey builder missions with 80%+ score',
    icon: '📋',
    condition: 'Survey score ≥ 80%',
    xpBonus: 50,
  },
  {
    id: 'empathy-expert',
    title: 'Empathy Expert',
    description: 'Achieve max empathy score in a dialogue mission',
    icon: '💛',
    condition: 'Empathy score = 100',
    xpBonus: 40,
  },
  {
    id: 'quick-thinker',
    title: 'Quick Thinker',
    description: 'Complete a mission with time remaining',
    icon: '⚡',
    condition: 'Time bonus > 0',
    xpBonus: 30,
  },
  {
    id: 'client-whisperer',
    title: 'Client Whisperer',
    description: 'Reveal all hidden client needs in one mission',
    icon: '🎯',
    condition: 'All needs revealed',
    xpBonus: 50,
  },
  {
    id: 'five-missions',
    title: 'Dedicated',
    description: 'Complete 5 missions',
    icon: '🌟',
    condition: 'Complete 5 missions',
    xpBonus: 75,
  },
  {
    id: 'perfect-score',
    title: 'Perfectionist',
    description: 'Score 100% on any mission',
    icon: '💎',
    condition: 'Total score = 100',
    xpBonus: 100,
  },
  {
    id: 'all-missions',
    title: 'Completionist',
    description: 'Complete all mission types',
    icon: '🏆',
    condition: 'All 5 mission types done',
    xpBonus: 150,
  },
  {
    id: 'feedback-pro',
    title: 'Feedback Pro',
    description: 'Categorise all feedback items correctly',
    icon: '📊',
    condition: '100% categorisation accuracy',
    xpBonus: 40,
  },
  {
    id: 'de-escalator',
    title: 'De-escalator',
    description: 'Turn an angry client into a satisfied one',
    icon: '🕊️',
    condition: 'Angry → Satisfied emotion shift',
    xpBonus: 60,
  },
];

// --- Avatar Options ---

export const AVATAR_OPTIONS = [
  { id: 'avatar-1', emoji: '🧑‍💼', label: 'Account Manager' },
  { id: 'avatar-2', emoji: '👩‍💼', label: 'Service Lead' },
  { id: 'avatar-3', emoji: '🧑‍💻', label: 'Support Analyst' },
  { id: 'avatar-4', emoji: '👩‍🔧', label: 'Field Technician' },
  { id: 'avatar-5', emoji: '👨‍💻', label: 'IT Consultant' },
  { id: 'avatar-6', emoji: '👩‍🏫', label: 'Training Officer' },
  { id: 'avatar-7', emoji: '🧑‍📋', label: 'QA Reviewer' },
  { id: 'avatar-8', emoji: '👨‍🔧', label: 'Service Engineer' },
];

// --- Timer Defaults ---

export const MISSION_TIMER_SECONDS: Record<MissionType, number> = {
  'survey-builder': 900,        // 15 min
  'customer-interview': 1200,   // 20 min
  'feedback-analysis': 1080,    // 18 min
  'difficult-client': 1500,     // 25 min
  'service-improvement': 1320,  // 22 min
};

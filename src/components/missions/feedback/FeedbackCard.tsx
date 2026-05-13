'use client';

import type { FeedbackItem } from '@/lib/stores/types';

// --- Pre-defined correct category mapping (for scoring) ---
export const CORRECT_CATEGORIES: Record<string, string> = {
  'fb-1': 'Service Quality',
  'fb-2': 'Response Time',
  'fb-3': 'Communication',
  'fb-4': 'Technical Competence',
  'fb-5': 'Pricing',
  'fb-6': 'Accessibility',
  'fb-7': 'Reliability',
  'fb-8': 'Training Needs',
  'fb-9': 'Service Quality',
  'fb-10': 'Response Time',
  'fb-11': 'Communication',
  'fb-12': 'Technical Competence',
  'fb-13': 'Pricing',
  'fb-14': 'Accessibility',
  'fb-15': 'Reliability',
  'fb-16': 'Training Needs',
};

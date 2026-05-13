import { create } from 'zustand';
import type { FeedbackItem } from './types';

// --- Store State ---

interface FeedbackState {
  items: FeedbackItem[];
  categories: string[];
  categorized: Record<string, string>;  // itemId -> category
  analysisNotes: string;
}

// --- Store Actions ---

interface FeedbackActions {
  setItems: (items: FeedbackItem[]) => void;
  addItem: (item: FeedbackItem) => void;
  setCategories: (categories: string[]) => void;
  categorizeItem: (itemId: string, category: string) => void;
  uncategorizeItem: (itemId: string) => void;
  setAnalysisNotes: (notes: string) => void;
  resetFeedback: () => void;
}

// --- Initial ---

const initialState: FeedbackState = {
  items: [],
  categories: [],
  categorized: {},
  analysisNotes: '',
};

// --- Store ---

export const useFeedbackStore = create<FeedbackState & FeedbackActions>()(
  (set) => ({
    ...initialState,

    setItems: (items) => set({ items, categorized: {} }),

    addItem: (item) =>
      set((s) => ({ items: [...s.items, item] })),

    setCategories: (categories) => set({ categories }),

    categorizeItem: (itemId, category) =>
      set((s) => ({
        categorized: { ...s.categorized, [itemId]: category },
      })),

    uncategorizeItem: (itemId) =>
      set((s) => {
        const { [itemId]: _, ...rest } = s.categorized;
        return { categorized: rest };
      }),

    setAnalysisNotes: (analysisNotes) => set({ analysisNotes }),

    resetFeedback: () => set({ ...initialState }),
  }),
);

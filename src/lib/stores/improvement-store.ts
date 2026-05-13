import { create } from 'zustand';

// --- Types ---

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  approved: boolean;
}

export interface ActionItem {
  id: string;
  recommendationId: string;
  task: string;
  assignee: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
}

// --- Store State ---

interface ImprovementState {
  recommendations: Recommendation[];
  actionItems: ActionItem[];
}

// --- Store Actions ---

interface ImprovementActions {
  addRecommendation: (rec: Omit<Recommendation, 'id' | 'approved'>) => void;
  updateRecommendation: (id: string, updates: Partial<Recommendation>) => void;
  removeRecommendation: (id: string) => void;
  approveRecommendation: (id: string) => void;
  addActionItem: (item: Omit<ActionItem, 'id'>) => void;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void;
  removeActionItem: (id: string) => void;
  resetImprovement: () => void;
}

// --- Helpers ---

let recCounter = 0;
let actionCounter = 0;

// --- Initial ---

const initialState: ImprovementState = {
  recommendations: [],
  actionItems: [],
};

// --- Store ---

export const useImprovementStore = create<ImprovementState & ImprovementActions>()(
  (set) => ({
    ...initialState,

    addRecommendation: (rec) => {
      recCounter += 1;
      const newRec: Recommendation = {
        ...rec,
        id: `rec-${Date.now()}-${recCounter}`,
        approved: false,
      };
      set((s) => ({ recommendations: [...s.recommendations, newRec] }));
    },

    updateRecommendation: (id, updates) =>
      set((s) => ({
        recommendations: s.recommendations.map((r) =>
          r.id === id ? { ...r, ...updates } : r,
        ),
      })),

    removeRecommendation: (id) =>
      set((s) => ({
        recommendations: s.recommendations.filter((r) => r.id !== id),
        actionItems: s.actionItems.filter((a) => a.recommendationId !== id),
      })),

    approveRecommendation: (id) =>
      set((s) => ({
        recommendations: s.recommendations.map((r) =>
          r.id === id ? { ...r, approved: true } : r,
        ),
      })),

    addActionItem: (item) => {
      actionCounter += 1;
      const newItem: ActionItem = {
        ...item,
        id: `action-${Date.now()}-${actionCounter}`,
      };
      set((s) => ({ actionItems: [...s.actionItems, newItem] }));
    },

    updateActionItem: (id, updates) =>
      set((s) => ({
        actionItems: s.actionItems.map((a) =>
          a.id === id ? { ...a, ...updates } : a,
        ),
      })),

    removeActionItem: (id) =>
      set((s) => ({
        actionItems: s.actionItems.filter((a) => a.id !== id),
      })),

    resetImprovement: () => {
      recCounter = 0;
      actionCounter = 0;
      set({ ...initialState });
    },
  }),
);

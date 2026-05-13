import { create } from 'zustand';
import type { SurveyDraft, SurveyQuestionDraft, SurveyQuestionType } from './types';

// --- Drag State ---

export interface DragState {
  isDragging: boolean;
  draggedQuestionId: string | null;
  dragOverIndex: number | null;
}

// --- Store State ---

interface SurveyState {
  draft: SurveyDraft;
  selectedQuestionId: string | null;
  dragState: DragState;
}

// --- Store Actions ---

interface SurveyActions {
  setSurveyTitle: (title: string) => void;
  setSurveyDescription: (description: string) => void;
  addQuestion: (type: SurveyQuestionType) => void;
  removeQuestion: (questionId: string) => void;
  updateQuestion: (questionId: string, updates: Partial<SurveyQuestionDraft>) => void;
  reorderQuestions: (fromIndex: number, toIndex: number) => void;
  selectQuestion: (questionId: string | null) => void;
  setDragState: (drag: Partial<DragState>) => void;
  resetDraft: () => void;
}

// --- Helpers ---

let questionCounter = 0;

// Example placeholder text per question type — guides the user
export const QUESTION_EXAMPLES: Record<SurveyQuestionType, string> = {
  'quantitative-rating': 'e.g. How would you rate the overall quality of our IT support service?',
  'quantitative-multiple': 'e.g. Which type of IT issue do you experience most frequently?',
  'quantitative-scale': 'e.g. How satisfied are you with the response time of our help desk?',
  'qualitative-open': 'e.g. Describe a recent IT issue you faced and how it was resolved.',
  'qualitative-yesno': 'e.g. Have you received adequate training on the current ticketing system?',
};

const MULTIPLE_CHOICE_EXAMPLES: string[][] = [
  ['Hardware failure', 'Software issues', 'Network connectivity', 'Account access'],
  ['Email problems', 'Printing issues', 'VPN/connection', 'File access'],
  ['Slow performance', 'Security concerns', 'Data backup', 'Other'],
];

function createQuestion(type: SurveyQuestionType): SurveyQuestionDraft {
  questionCounter += 1;
  const base: SurveyQuestionDraft = {
    id: `q-${Date.now()}-${questionCounter}`,
    type,
    text: '',
    required: false,
  };

  switch (type) {
    case 'quantitative-multiple':
      return {
        ...base,
        options: MULTIPLE_CHOICE_EXAMPLES[questionCounter % MULTIPLE_CHOICE_EXAMPLES.length],
      };
    case 'quantitative-scale':
      return { ...base, scaleMin: 1, scaleMax: 5, scaleLabel: 'Strongly Disagree → Strongly Agree' };
    case 'quantitative-rating':
      return { ...base, scaleMin: 1, scaleMax: 5 };
    default:
      return base;
  }
}

// --- Initial ---

const emptyDraft: SurveyDraft = {
  title: '',
  description: '',
  questions: [],
};

const initialDrag: DragState = {
  isDragging: false,
  draggedQuestionId: null,
  dragOverIndex: null,
};

// --- Store ---

export const useSurveyStore = create<SurveyState & SurveyActions>()((set) => ({
  draft: { ...emptyDraft },
  selectedQuestionId: null,
  dragState: { ...initialDrag },

  setSurveyTitle: (title) =>
    set((s) => ({ draft: { ...s.draft, title } })),

  setSurveyDescription: (description) =>
    set((s) => ({ draft: { ...s.draft, description } })),

  addQuestion: (type) =>
    set((s) => {
      const question = createQuestion(type);
      return {
        draft: { ...s.draft, questions: [...s.draft.questions, question] },
        selectedQuestionId: question.id,
      };
    }),

  removeQuestion: (questionId) =>
    set((s) => ({
      draft: {
        ...s.draft,
        questions: s.draft.questions.filter((q) => q.id !== questionId),
      },
      selectedQuestionId:
        s.selectedQuestionId === questionId ? null : s.selectedQuestionId,
    })),

  updateQuestion: (questionId, updates) =>
    set((s) => ({
      draft: {
        ...s.draft,
        questions: s.draft.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q,
        ),
      },
    })),

  reorderQuestions: (fromIndex, toIndex) =>
    set((s) => {
      const questions = [...s.draft.questions];
      const [moved] = questions.splice(fromIndex, 1);
      questions.splice(toIndex, 0, moved);
      return { draft: { ...s.draft, questions } };
    }),

  selectQuestion: (questionId) => set({ selectedQuestionId: questionId }),

  setDragState: (drag) =>
    set((s) => ({ dragState: { ...s.dragState, ...drag } })),

  resetDraft: () =>
    set({ draft: { ...emptyDraft }, selectedQuestionId: null, dragState: { ...initialDrag } }),
}));

import { create } from 'zustand';

interface TestSessionStore {
  sessionId: string | null;
  answers: Record<string, string>;
  markedForReview: Record<string, boolean>;
  currentQuestionIndex: number;
  isDirty: boolean;
  tabSwitchCount: number;

  setAnswer: (questionId: string, answer: string) => void;
  clearAnswer: (questionId: string) => void;
  toggleMark: (questionId: string) => void;
  goTo: (index: number) => void;
  markClean: () => void;
  setTabSwitchCount: (count: number) => void;
  hydrate: (params: {
    sessionId: string;
    answers: Record<string, string>;
    markedForReview: Record<string, boolean>;
    tabSwitchCount: number;
  }) => void;
  reset: () => void;
}

export const useTestSessionStore = create<TestSessionStore>((set) => ({
  sessionId: null,
  answers: {},
  markedForReview: {},
  currentQuestionIndex: 0,
  isDirty: false,
  tabSwitchCount: 0,

  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
      isDirty: true,
    })),

  clearAnswer: (questionId) =>
    set((state) => {
      const next = { ...state.answers };
      delete next[questionId];
      return { answers: next, isDirty: true };
    }),

  toggleMark: (questionId) =>
    set((state) => ({
      markedForReview: {
        ...state.markedForReview,
        [questionId]: !state.markedForReview[questionId],
      },
      isDirty: true,
    })),

  goTo: (index) => set({ currentQuestionIndex: index }),

  markClean: () => set({ isDirty: false }),

  setTabSwitchCount: (count) => set({ tabSwitchCount: count }),

  hydrate: ({ sessionId, answers, markedForReview, tabSwitchCount }) =>
    set({
      sessionId,
      answers,
      markedForReview,
      tabSwitchCount,
      isDirty: false,
      currentQuestionIndex: 0,
    }),

  reset: () =>
    set({
      sessionId: null,
      answers: {},
      markedForReview: {},
      currentQuestionIndex: 0,
      isDirty: false,
      tabSwitchCount: 0,
    }),
}));

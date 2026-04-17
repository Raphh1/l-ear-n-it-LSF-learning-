import { create } from 'zustand';
import { progressApi, type ProgressResponse } from '@/lib/api/progress';

interface ProgressState {
  progress: ProgressResponse | null;
  fetch: () => Promise<void>;
  addXp: (amount: number) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progress: null,

  fetch: async () => {
    try {
      const data = await progressApi.getMe();
      set({ progress: data });
    } catch {
      // non connecté ou erreur réseau — silencieux
    }
  },

  addXp: (amount: number) =>
    set((state) => ({
      progress: state.progress
        ? { ...state.progress, xpTotal: state.progress.xpTotal + amount }
        : null,
    })),

  reset: () => set({ progress: null }),
}));

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProgressStore } from '@/store/progressStore';

// Isolate Zustand state between tests
beforeEach(() => {
  useProgressStore.setState({ progress: null });
});

const makeProgress = (xpTotal = 0) => ({
  xpTotal,
  streak: 0,
  lastActivityDate: null,
});

describe('progressStore', () => {
  describe('addXp', () => {
    it('does nothing when progress is null', () => {
      useProgressStore.getState().addXp(50);
      expect(useProgressStore.getState().progress).toBeNull();
    });

    it('increases xpTotal by the given amount', () => {
      useProgressStore.setState({ progress: makeProgress(100) });
      useProgressStore.getState().addXp(25);
      expect(useProgressStore.getState().progress?.xpTotal).toBe(125);
    });

    it('accumulates multiple calls', () => {
      useProgressStore.setState({ progress: makeProgress(0) });
      useProgressStore.getState().addXp(10);
      useProgressStore.getState().addXp(10);
      useProgressStore.getState().addXp(10);
      expect(useProgressStore.getState().progress?.xpTotal).toBe(30);
    });

    it('does not mutate other fields', () => {
      const initial = { xpTotal: 50, streak: 7, lastActivityDate: '2026-04-27' };
      useProgressStore.setState({ progress: initial });
      useProgressStore.getState().addXp(10);
      const p = useProgressStore.getState().progress!;
      expect(p.streak).toBe(7);
      expect(p.lastActivityDate).toBe('2026-04-27');
    });
  });

  describe('reset', () => {
    it('sets progress back to null', () => {
      useProgressStore.setState({ progress: makeProgress(200) });
      useProgressStore.getState().reset();
      expect(useProgressStore.getState().progress).toBeNull();
    });
  });
});

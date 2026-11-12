import { api } from '@/lib/api';
import type { SignStat, GlobalStats, RevisionSign } from '@/lib/types';

export interface SignAttempt {
  signId: string;
  isCorrect: boolean;
}

export const revisionApi = {
  submitAttempts: (attempts: SignAttempt[]) =>
    api.post('/api/revision', { attempts }),

  getDueSigns: () =>
    api.get<RevisionSign[]>('/api/revision/due'),

  getSignsForLesson: (lessonId: string) =>
    api.get<RevisionSign[]>(`/api/revision/lesson/${lessonId}`),

  getSignStat: (signId: string) =>
    api.get<SignStat>(`/api/revision/stats/${signId}`).catch(() => null),

  getGlobalStats: () =>
    api.get<GlobalStats>('/api/revision/stats/global').catch(() => null),
};

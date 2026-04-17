import { api } from '@/lib/api';

export interface ProgressResponse {
  xpTotal: number;
  streakDays: number;
  lessonsCompleted: number;
  completedLessonIds: string[];
}

export interface CompleteLessonResponse {
  xpEarned: number;
  isFirstCompletion: boolean;
  newXpTotal: number;
  newStreakDays: number;
}

export interface AwardXpResponse {
  xpEarned: number;
  newXpTotal: number;
  newStreakDays: number;
}

export const progressApi = {
  getMe: () => api.get<ProgressResponse>('/api/progress/me'),
  completeLesson: (lessonId: string, score: number, total: number) =>
    api.post<CompleteLessonResponse>(`/api/progress/lessons/${lessonId}/complete`, { score, total }),
  awardXp: (amount: number) =>
    api.post<AwardXpResponse>('/api/progress/xp', { amount }),
};

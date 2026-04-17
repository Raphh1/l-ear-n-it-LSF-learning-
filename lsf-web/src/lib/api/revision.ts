import { api } from '@/lib/api';

export interface SignAttempt {
  signId: string;
  isCorrect: boolean;
}

export interface RevisionSign {
  id: string;
  word: string;
  slug: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  gifUrl: string | null;
  wrongCount: number;
  correctCount: number;
}

export const revisionApi = {
  submitAttempts: (attempts: SignAttempt[]) =>
    api.post('/api/revision', { attempts }),

  getSignsForLesson: (lessonId: string) =>
    api.get<RevisionSign[]>(`/api/revision/lesson/${lessonId}`),
};

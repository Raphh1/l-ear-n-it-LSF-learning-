import { api } from '@/lib/api';
import type { PhraseLesson } from '@/lib/types';

export const phrasesApi = {
  getByLesson: (lessonId: string) =>
    api.get<PhraseLesson>(`/api/phrases/lesson/${lessonId}`),
};

import { api } from '@/lib/api';
import type { LessonDetail } from '@/lib/types';

export const lessonsApi = {
  getById: (id: string) => api.get<LessonDetail>(`/api/lessons/${id}`),
};

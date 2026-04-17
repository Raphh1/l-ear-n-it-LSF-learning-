import { api } from '@/lib/api';
import type { Category } from '@/lib/types';

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/api/categories'),
};

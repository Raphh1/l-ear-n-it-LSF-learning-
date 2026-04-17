import { api } from '@/lib/api';
import type { Module, ModuleDetail } from '@/lib/types';

export const modulesApi = {
  getAll: () => api.get<Module[]>('/api/modules'),
  getById: (id: number) => api.get<ModuleDetail>(`/api/modules/${id}`),
};

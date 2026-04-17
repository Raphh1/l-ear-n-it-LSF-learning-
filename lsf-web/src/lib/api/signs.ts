import { api } from '@/lib/api';
import type { ElixWordResult, PagedResult, SignDetail, SignSummary } from '@/lib/types';

export interface SignsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
}

export const signsApi = {
  getAll: (query: SignsQuery = {}) => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));
    if (query.search) params.set('search', query.search);
    if (query.categoryId) params.set('categoryId', String(query.categoryId));
    return api.get<PagedResult<SignSummary>>(`/api/signs?${params.toString()}`);
  },
  getBySlug: (slug: string) => api.get<SignDetail>(`/api/signs/${slug}`),
  getElixVideos: (word: string) => api.get<ElixWordResult>(`/api/signs/elix?word=${encodeURIComponent(word)}`),
};

import { api } from '@/lib/api';
import { signsApi } from '@/lib/api/signs';
import type { SignSummary } from '@/lib/types';

export interface FavoriteSign extends Omit<SignSummary, 'categoryName'> {
  categoryName: string;
  createdAt: string;
}

export interface FavoritesFetchResult {
  items: FavoriteSign[];
  compatibilityMode: boolean;
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Error && /404/.test(error.message);
}

export const favoritesApi = {
  getAll: async (): Promise<FavoritesFetchResult> => {
    try {
      const items = await api.get<FavoriteSign[]>('/api/favorites');
      return {
        items,
        compatibilityMode: false,
      };
    } catch (error) {
      if (!isNotFoundError(error)) throw error;

      const ids: string[] = await api.get<string[]>('/api/favorites/ids').catch((): string[] => []);
      if (ids.length === 0) {
        return {
          items: [],
          compatibilityMode: true,
        };
      }

      const pageSize = Math.max(200, ids.length);
      const signs = await signsApi.getAll({ page: 1, pageSize }).then((res) => res.items).catch(() => []);

      const items = signs
        .filter((sign) => ids.includes(sign.id))
        .map((sign) => ({
          ...sign,
          createdAt: new Date(0).toISOString(),
        }));

      return {
        items,
        compatibilityMode: true,
      };
    }
  },
  getIds: () => api.get<string[]>('/api/favorites/ids'),
  add: async (signId: string) => {
    try {
      await api.post<void>(`/api/favorites/${signId}`, {});
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }
  },
  remove: async (signId: string) => {
    try {
      await api.delete<void>(`/api/favorites/${signId}`);
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }
  },
};

import { api } from '@/lib/api';
import type { GameSession } from '@/lib/types';

export const historyApi = {
  getHistory: (page = 1, pageSize = 20) =>
    api.get<GameSession[]>(`/api/scores/me/history?page=${page}&pageSize=${pageSize}`).catch(() => []),
};

import { api } from '@/lib/api';
import type { DailyQuest } from '@/lib/types';

export const questsApi = {
  getToday: () =>
    api.get<DailyQuest[]>('/api/quests/today').catch(() => null),
};

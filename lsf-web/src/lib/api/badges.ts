import { api } from '@/lib/api';

export interface BadgeDto {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
}

export const badgesApi = {
  getMyBadges: () => api.get<BadgeDto[]>('/api/badges/me'),
};

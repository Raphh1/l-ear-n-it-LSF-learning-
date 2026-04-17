import { api } from '@/lib/api';

export interface LeaderboardEntry {
  username: string;
  score: number;
  playedAt: string;
}

export interface GlobalLeaderboardEntry {
  username: string;
  totalScore: number;
  rank: number;
}

export const scoresApi = {
  submit: (gameType: string, lessonId: string, score: number) =>
    api.post('/api/scores', { gameType, lessonId, score }),

  getLeaderboard: (game: string, lessonId: string) =>
    api.get<LeaderboardEntry[]>(`/api/scores/leaderboard?game=${game}&lessonId=${lessonId}`),

  getMyBest: (game: string, lessonId: string) =>
    api.get<{ best: number | null }>(`/api/scores/me/best?game=${game}&lessonId=${lessonId}`),

  getGlobalLeaderboard: () =>
    api.get<GlobalLeaderboardEntry[]>('/api/scores/leaderboard/global'),
};

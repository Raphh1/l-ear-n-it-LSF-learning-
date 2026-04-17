import { api } from '@/lib/api';

export interface DailySign {
  id: string;
  word: string;
  slug: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  gifUrl: string | null;
}

export interface DailyChallenge {
  sign: DailySign;
  choices: string[];
  date: string;
  alreadyPlayed: boolean;
  wasCorrect: boolean | null;
}

export interface SubmitDailyResponse {
  isCorrect: boolean;
  correctWord: string;
  xpEarned: number;
  newXpTotal: number;
}

export const dailyApi = {
  getToday: () => api.get<DailyChallenge>('/api/daily'),
  submit: (chosenWord: string) =>
    api.post<SubmitDailyResponse>('/api/daily/submit', { chosenWord }),
};

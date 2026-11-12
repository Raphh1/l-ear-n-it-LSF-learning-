'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { scoresApi, type LeaderboardEntry } from '@/lib/api/scores';

interface LeaderboardProps {
  game: string;
  lessonId: string;
  /** Libellé d'unité du score (ex: "pts", "%", "paires") */
  unit?: string;
}

const RANK_COLORS = ['bg-sun', 'bg-white', 'bg-tomato'];

export function Leaderboard({ game, lessonId, unit = 'pts' }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    scoresApi.getLeaderboard(game, lessonId)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [game, lessonId]);

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12" />)}
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="py-4 text-center font-bold">Sois le premier à te classer !</p>;
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="mb-1 flex items-center gap-2">
        <Trophy className="h-5 w-5" strokeWidth={2.5} />
        <span className="font-display text-lg font-extrabold">Classement</span>
      </div>
      {entries.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-3 border-2 border-ink bg-white px-3 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink text-sm font-extrabold ${RANK_COLORS[i] ?? 'bg-paper'}`}>
              {i + 1}
            </span>
            <span className="truncate font-bold">{entry.username}</span>
          </div>
          <span className="shrink-0 font-display font-extrabold tabular-nums">{entry.score} {unit}</span>
        </div>
      ))}
    </div>
  );
}

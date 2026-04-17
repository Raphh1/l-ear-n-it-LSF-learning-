'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { scoresApi, type LeaderboardEntry } from '@/lib/api/scores';

interface LeaderboardProps {
  game: string;
  lessonId: string;
  /** Libellé d'unité du score (ex: "pts", "%", "paires") */
  unit?: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];

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
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-white/30 text-sm text-center py-4">
        Sois le premier à te classer !
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-4 h-4 text-amber-400" />
        <span className="text-white/60 text-sm font-semibold">Classement</span>
      </div>
      {entries.map((entry, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05 }}
          className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border ${
            i === 0
              ? 'border-amber-400/30 bg-amber-400/8'
              : 'border-white/8 bg-white/4'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-base w-5 text-center shrink-0">
              {MEDALS[i] ?? <Medal className="w-4 h-4 text-white/30" />}
            </span>
            <span className={`text-sm font-medium truncate ${i === 0 ? 'text-amber-200' : 'text-white/70'}`}>
              {entry.username}
            </span>
          </div>
          <span className={`text-sm font-bold shrink-0 tabular-nums ${i === 0 ? 'text-amber-300' : 'text-white/50'}`}>
            {entry.score} {unit}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

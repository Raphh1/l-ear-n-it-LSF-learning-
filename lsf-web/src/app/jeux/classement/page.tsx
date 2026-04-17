'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, Medal } from 'lucide-react';
import { scoresApi, type GlobalLeaderboardEntry } from '@/lib/api/scores';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ClassementPage() {
  const [entries, setEntries] = useState<GlobalLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    scoresApi.getGlobalLeaderboard()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />

      <div className="relative max-w-lg mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2"
        >
          <Link
            href="/jeux"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Jeux
          </Link>
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Classement global</h1>
          </div>
          <p className="text-white/40 text-sm">
            Score total — somme des meilleurs scores sur tous les jeux et toutes les leçons.
          </p>
        </motion.div>

        {/* Podium top 3 */}
        {!isLoading && entries.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-end justify-center gap-3"
          >
            {/* 2ème */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-2xl">🥈</span>
              <div className="w-full rounded-t-xl bg-white/8 border border-white/10 flex flex-col items-center py-4 px-2" style={{ height: '100px' }}>
                <span className="text-white/80 text-sm font-semibold truncate max-w-full">{entries[1].username}</span>
                <span className="text-white/40 text-xs mt-1">{entries[1].totalScore} pts</span>
              </div>
            </div>
            {/* 1er */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-3xl">🥇</span>
              <div className="w-full rounded-t-xl bg-amber-400/10 border border-amber-400/30 flex flex-col items-center py-4 px-2" style={{ height: '130px' }}>
                <span className="text-amber-200 text-sm font-bold truncate max-w-full">{entries[0].username}</span>
                <span className="text-amber-400 text-xs mt-1 font-semibold">{entries[0].totalScore} pts</span>
              </div>
            </div>
            {/* 3ème */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-2xl">🥉</span>
              <div className="w-full rounded-t-xl bg-white/8 border border-white/10 flex flex-col items-center py-4 px-2" style={{ height: '80px' }}>
                <span className="text-white/80 text-sm font-semibold truncate max-w-full">{entries[2].username}</span>
                <span className="text-white/40 text-xs mt-1">{entries[2].totalScore} pts</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Liste complète */}
        <div className="flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
            ))
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-10 flex items-center justify-center">
              <p className="text-white/30 text-sm text-center">
                Aucun score pour l&apos;instant — sois le premier !
              </p>
            </div>
          ) : (
            entries.map((entry, i) => (
              <motion.div
                key={entry.username}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${
                  i === 0
                    ? 'border-amber-400/30 bg-amber-400/8'
                    : 'border-white/8 bg-white/4'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base w-6 text-center shrink-0">
                    {MEDALS[i] ?? <Medal className="w-4 h-4 text-white/30 inline" />}
                  </span>
                  <span className={`text-sm font-medium truncate ${i === 0 ? 'text-amber-200' : 'text-white/70'}`}>
                    {entry.username}
                  </span>
                </div>
                <span className={`text-sm font-bold shrink-0 tabular-nums ${i === 0 ? 'text-amber-300' : 'text-white/50'}`}>
                  {entry.totalScore} pts
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

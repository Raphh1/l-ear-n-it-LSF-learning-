'use client';

import { useEffect, useState } from 'react';
import { scoresApi, type GlobalLeaderboardEntry } from '@/lib/api/scores';
import { BackLink } from '@/components/brand/BackLink';
import { PageHeader } from '@/components/brand/PageHeader';

// Podium : ordre d'affichage 2e, 1er, 3e
const PODIUM = [
  { rank: 1, height: 'h-32', color: 'bg-white', tilt: '-rotate-1' },
  { rank: 0, height: 'h-44', color: 'bg-sun', tilt: 'rotate-0' },
  { rank: 2, height: 'h-24', color: 'bg-tomato', tilt: 'rotate-1' },
];

const RANK_COLORS = ['bg-sun', 'bg-white', 'bg-tomato'];

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
    <div className="px-6 py-14">
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <BackLink href="/jeux">Jeux</BackLink>

        <PageHeader kicker="Hall of fame" kickerClass="bg-sun" title="Classement global">
          Somme des meilleurs scores sur tous les jeux et toutes les leçons.
        </PageHeader>

        {!isLoading && entries.length >= 3 && (
          <div className="flex items-end justify-center gap-3">
            {PODIUM.map(({ rank, height, color, tilt }) => (
              <div key={rank} className={`flex flex-1 flex-col items-center gap-2 ${tilt}`}>
                <span className="max-w-full truncate font-display text-lg font-extrabold">{entries[rank].username}</span>
                <span className="sticker bg-white">{entries[rank].totalScore} pts</span>
                <div className={`panel flex w-full items-start justify-center pt-3 ${height} ${color}`}>
                  <span className="font-display text-5xl font-extrabold">{rank + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <ol className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <li key={i} className="skeleton h-14" />)
          ) : entries.length === 0 ? (
            <li className="panel p-10 text-center font-display text-xl font-extrabold">
              Aucun score pour l&apos;instant. Sois le premier !
            </li>
          ) : (
            entries.map((entry, i) => (
              <li key={entry.username} className={`panel-flat flex items-center justify-between gap-3 px-4 py-3 ${i === 0 ? 'shadow-hard' : ''}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink font-display font-extrabold ${RANK_COLORS[i] ?? 'bg-paper'}`}>
                    {i + 1}
                  </span>
                  <span className="truncate font-bold">{entry.username}</span>
                </div>
                <span className="shrink-0 font-display text-lg font-extrabold tabular-nums">{entry.totalScore} pts</span>
              </li>
            ))
          )}
        </ol>
      </div>
    </div>
  );
}

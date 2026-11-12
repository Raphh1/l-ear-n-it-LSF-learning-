'use client';

import { Clock, Target } from 'lucide-react';
import type { GameSession } from '@/lib/types';

interface Props {
  sessions: GameSession[];
  isLoading: boolean;
}

const GAME_LABELS: Record<string, string> = {
  vitesse: 'Vitesse',
  inverse: 'Inverse',
  memoire: 'Mémoire',
  survie: 'Survie',
  quiz: 'Quiz',
  revision: 'Révision',
  srs: 'SRS',
  constructeur: 'Phrases',
};

// Même code couleur que la salle de jeux : tomate = jouer, vert = réviser, bleu = phrases
const GAME_COLORS: Record<string, string> = {
  revision: 'bg-mint',
  srs: 'bg-mint',
  constructeur: 'bg-ocean text-white',
};

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m${String(sec).padStart(2, '0')}s` : `${sec}s`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function GameHistoryList({ sessions, isLoading }: Props) {
  if (isLoading) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-extrabold">Historique des parties</h2>
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16" />)}
        </div>
      </section>
    );
  }

  if (sessions.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-extrabold">Historique des parties</h2>
        <div className="panel p-6 text-center font-bold">Aucune partie jouée pour l&apos;instant.</div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-3xl font-extrabold">Historique des parties</h2>
      <div className="flex flex-col gap-2">
        {sessions.map((s, i) => {
          const accuracy = s.correctCount != null && s.wrongCount != null
            ? Math.round((s.correctCount / (s.correctCount + s.wrongCount)) * 100)
            : null;
          return (
            <div key={i} className="flex items-center gap-4 border-2 border-ink bg-white px-4 py-3">
              <span className={`sticker w-20 shrink-0 justify-center ${GAME_COLORS[s.gameType] ?? 'bg-tomato'}`}>
                {GAME_LABELS[s.gameType] ?? s.gameType}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{s.lessonTitle}</p>
                <p className="text-sm text-ink/70">{formatDate(s.playedAt)}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-sm font-bold">
                {accuracy !== null && <span className="hidden items-center gap-1 sm:flex"><Target className="h-4 w-4" /> {accuracy}%</span>}
                {s.durationSeconds != null && <span className="hidden items-center gap-1 sm:flex"><Clock className="h-4 w-4" /> {formatDuration(s.durationSeconds)}</span>}
                <span className="font-display text-lg font-extrabold">{s.score} pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

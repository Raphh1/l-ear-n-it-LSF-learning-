'use client';

import Link from 'next/link';
import { Star, Trophy, RefreshCw } from 'lucide-react';
import type { CompleteLessonResponse } from '@/lib/api/progress';

interface Props {
  score: number;
  total: number;
  xpReward: number;
  lessonId: string;
  completion: CompleteLessonResponse | null;
  onRestart: () => void;
}

export function QuizResult({ score, total, xpReward, lessonId, completion, onRestart }: Props) {
  const percent = Math.round((score / total) * 100);
  const xpEarned = completion?.xpEarned ?? Math.round((score / total) * xpReward);

  const feedback =
    percent === 100 ? 'Parfait !' :
    percent >= 75   ? 'Très bien !' :
    percent >= 50   ? 'Pas mal !' :
                      'Continue à t\'entraîner !';

  const color = percent >= 75 ? 'bg-mint' : percent >= 50 ? 'bg-sun' : 'bg-tomato';

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="flex flex-col items-center gap-4">
        <span className={`flex h-24 w-24 -rotate-6 items-center justify-center border-[3px] border-ink shadow-hard-lg ${color}`}>
          <Trophy className="h-12 w-12" strokeWidth={2.5} />
        </span>
        <h2 className="text-center text-5xl font-extrabold">{feedback}</h2>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="font-display text-8xl font-extrabold leading-none">
          {score}<span className="text-5xl text-ink/50">/{total}</span>
        </span>
        <span className="font-bold">{percent}% de bonnes réponses</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="tile rotate-2 bg-sun text-xl">
          <Star className="mr-2 h-5 w-5 fill-ink" /> +{xpEarned} XP
        </span>
        {completion?.isFirstCompletion && (
          <span className="sticker mt-2 bg-mint">Première complétion : XP enregistrés !</span>
        )}
      </div>

      <div className="flex w-full max-w-md flex-col items-stretch gap-4 sm:flex-row">
        <button onClick={onRestart} className="btn flex-1">
          <RefreshCw className="h-5 w-5" /> Recommencer
        </button>
        <Link href={`/lessons/${lessonId}`} className="btn btn-ink flex-1">Retour à la leçon</Link>
      </div>
    </div>
  );
}

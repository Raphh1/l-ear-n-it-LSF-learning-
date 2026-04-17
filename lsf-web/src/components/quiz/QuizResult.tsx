'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
    percent === 100 ? 'Parfait ! 🎉' :
    percent >= 75   ? 'Très bien !' :
    percent >= 50   ? 'Pas mal !' :
                      'Continue à t\'entraîner !';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-8 py-8"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600">
          <Trophy className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">{feedback}</h2>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-7xl font-black text-white">{score}<span className="text-white/30 text-4xl">/{total}</span></span>
        <span className="text-white/40 text-sm">{percent}% de bonnes réponses</span>
      </div>

      {/* XP */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-amber-400/10 border border-amber-400/20">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 font-semibold text-sm">+{xpEarned} XP gagnés</span>
        </div>
        {completion?.isFirstCompletion && (
          <span className="text-emerald-400 text-xs font-medium">
            Première complétion — XP enregistrés !
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Recommencer
        </button>
        <Link
          href={`/lessons/${lessonId}`}
          className="flex items-center justify-center w-full px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
        >
          Retour à la leçon
        </Link>
      </div>
    </motion.div>
  );
}

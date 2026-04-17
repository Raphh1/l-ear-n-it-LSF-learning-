'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SignMedia } from '@/components/signs/SignMedia';
import { ChevronLeft, Trophy, RefreshCw, Star, CheckCircle2, XCircle } from 'lucide-react';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { lessonsApi } from '@/lib/api/lessons';
import { progressApi, type CompleteLessonResponse } from '@/lib/api/progress';
import { scoresApi } from '@/lib/api/scores';
import { revisionApi } from '@/lib/api/revision';
import type { LessonDetail, SignInLesson } from '@/lib/types';

interface InverseQuestion {
  targetSign: SignInLesson;
  choices: SignInLesson[];   // 4 signes dont le bon
  correctId: string;
}

function generateQuestions(signs: SignInLesson[]): InverseQuestion[] {
  const shuffled = [...signs].sort(() => Math.random() - 0.5);
  return shuffled.map((sign) => {
    const wrong = signs
      .filter((s) => s.id !== sign.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [...wrong, sign].sort(() => Math.random() - 0.5);
    return { targetSign: sign, choices, correctId: sign.id };
  });
}

type Phase = 'playing' | 'result';

export default function InversePage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<InverseQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completion, setCompletion] = useState<CompleteLessonResponse | null>(null);
  const attemptsRef = useRef<{ signId: string; isCorrect: boolean }[]>([]);

  useEffect(() => {
    lessonsApi.getById(lessonId)
      .then((data) => {
        setLesson(data);
        setQuestions(generateQuestions(data.signs));
      })
      .catch(() => router.push('/jeux/inverse'))
      .finally(() => setIsLoading(false));
  }, [lessonId, router]);

  function handleSelect(id: string) {
    if (selectedId !== null) return;
    setSelectedId(id);
    const isCorrect = id === questions[currentIndex].correctId;
    if (isCorrect) setScore((s) => s + 1);
    attemptsRef.current.push({ signId: questions[currentIndex].targetSign.id, isCorrect });
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      const finalScore = score;
      const pct = Math.round((finalScore / questions.length) * 100);
      progressApi.completeLesson(lessonId, finalScore, questions.length)
        .then(setCompletion)
        .catch(() => {});
      scoresApi.submit('inverse', lessonId, pct).catch(() => {});
      revisionApi.submitAttempts(attemptsRef.current).catch(() => {});
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedId(null);
    }
  }

  const handleRestart = useCallback(() => {
    if (!lesson) return;
    setQuestions(generateQuestions(lesson.signs));
    setCurrentIndex(0);
    setScore(0);
    setPhase('playing');
    setSelectedId(null);
    setCompletion(null);
    attemptsRef.current = [];
  }, [lesson]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lesson) return null;

  // ─── Résultats ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const percent = Math.round((score / questions.length) * 100);
    const xpEarned = completion?.xpEarned ?? Math.round((score / questions.length) * lesson.xpReward);
    const feedback =
      percent === 100 ? 'Parfait !' :
      percent >= 75   ? 'Très bien !' :
      percent >= 50   ? 'Pas mal !' :
                        'Continue à t\'entraîner !';

    return (
      <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-600/15 blur-[120px]" />

        <div className="relative max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8 py-8"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
                <Trophy className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{feedback}</h2>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-7xl font-black text-white">
                {score}<span className="text-white/30 text-4xl">/{questions.length}</span>
              </span>
              <span className="text-white/40 text-sm">{percent}% de bonnes réponses</span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-amber-400/10 border border-amber-400/20">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm">+{xpEarned} XP gagnés</span>
            </div>
            {completion?.isFirstCompletion && (
              <span className="text-emerald-400 text-xs font-medium">
                Première complétion — XP enregistrés !
              </span>
            )}

            <div className="w-full max-w-xs">
              <Leaderboard game="inverse" lessonId={lessonId} unit="%" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
              <button
                onClick={handleRestart}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Recommencer
              </button>
              <Link
                href={`/lessons/${lessonId}`}
                className="flex items-center justify-center w-full px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
              >
                Retour à la leçon
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Jeu ─────────────────────────────────────────────────────────────────────
  const q = questions[currentIndex];
  const isAnswered = selectedId !== null;

  function getImageStyle(signId: string): string {
    const base = 'relative aspect-square rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer';
    if (!isAnswered) {
      return `${base} bg-white/5 border-white/10 hover:border-white/30 hover:scale-[1.02]`;
    }
    if (signId === q.correctId) {
      return `${base} bg-emerald-500/10 border-emerald-500/50`;
    }
    if (signId === selectedId) {
      return `${base} bg-rose-500/10 border-rose-500/50`;
    }
    return `${base} bg-white/5 border-white/5 opacity-40`;
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-600/15 blur-[120px]" />

      <div className="relative max-w-xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-1"
        >
          <Link
            href={`/jeux/inverse`}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-white mt-3">{lesson.title}</h1>
          <p className="text-white/30 text-sm">Mode inversé</p>
        </motion.div>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-8"
        >
          {/* Progress */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-white/30">
              <span>Question {currentIndex + 1} / {questions.length}</span>
              <span>{Math.round((currentIndex / questions.length) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                initial={{ width: `${(currentIndex / questions.length) * 100}%` }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Mot cible */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-white/40 text-sm">Quel signe correspond au mot :</p>
            <p className="text-4xl font-black text-white tracking-tight">{q.targetSign.word}</p>
          </div>

          {/* Grille 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {q.choices.map((sign) => (
              <button
                key={sign.id}
                onClick={() => handleSelect(sign.id)}
                className={getImageStyle(sign.id)}
                disabled={isAnswered}
              >
                <SignMedia sign={sign} />

                {/* Overlay feedback */}
                {isAnswered && (
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-2 pointer-events-none">
                    <div className="w-full flex items-center justify-center gap-1 rounded-lg py-1 px-2 bg-black/60 backdrop-blur-sm">
                      {sign.id === q.correctId ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : sign.id === selectedId ? (
                        <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      ) : null}
                      <span className={`text-xs font-semibold truncate ${
                        sign.id === q.correctId ? 'text-emerald-300' :
                        sign.id === selectedId ? 'text-rose-300' :
                        'text-white/40'
                      }`}>
                        {sign.word}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Feedback + bouton suivant */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4"
            >
              <p className={`text-sm font-medium ${selectedId === q.correctId ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedId === q.correctId ? 'Bonne réponse !' : `La bonne réponse était : ${q.targetSign.word}`}
              </p>
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
              >
                {currentIndex + 1 === questions.length ? 'Voir les résultats' : 'Question suivante'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

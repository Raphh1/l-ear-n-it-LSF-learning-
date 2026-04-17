'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SignMedia } from '@/components/signs/SignMedia';
import { ChevronLeft, Trophy, RefreshCw, Star, Timer } from 'lucide-react';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { lessonsApi } from '@/lib/api/lessons';
import { scoresApi } from '@/lib/api/scores';
import { revisionApi } from '@/lib/api/revision';
import { progressApi } from '@/lib/api/progress';
import { useProgressStore } from '@/store/progressStore';
import type { LessonDetail, SignInLesson } from '@/lib/types';

const XP_PER_CORRECT = 3;

const INITIAL_TIME = 30;
const TIME_BONUS = 5;

interface Question {
  target: SignInLesson;
  choices: SignInLesson[];
  correctId: string;
}

function buildQuestion(target: SignInLesson, allSigns: SignInLesson[]): Question {
  const wrong = allSigns
    .filter((s) => s.id !== target.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [...wrong, target].sort(() => Math.random() - 0.5);
  return { target, choices, correctId: target.id };
}

type Phase = 'playing' | 'result';

export default function SurviePage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('playing');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bonusKey, setBonusKey] = useState(0);

  const addXp = useProgressStore((s) => s.addXp);
  const poolRef = useRef<SignInLesson[]>([]);
  const signsRef = useRef<SignInLesson[]>([]);
  const attemptsRef = useRef<{ signId: string; isCorrect: boolean }[]>([]);

  function pickNext(signs: SignInLesson[]) {
    if (poolRef.current.length === 0) {
      poolRef.current = [...signs].sort(() => Math.random() - 0.5);
    }
    const target = poolRef.current.pop()!;
    setQuestion(buildQuestion(target, signs));
    setSelectedId(null);
  }

  useEffect(() => {
    lessonsApi.getById(lessonId)
      .then((data) => {
        setLesson(data);
        signsRef.current = data.signs;
        poolRef.current = [...data.signs].sort(() => Math.random() - 0.5);
        const target = poolRef.current.pop()!;
        setQuestion(buildQuestion(target, data.signs));
      })
      .catch(() => router.push('/jeux/survie'))
      .finally(() => setIsLoading(false));
  }, [lessonId, router]);

  // Timer — 1 tick/s while playing
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // End game when time hits 0
  useEffect(() => {
    if (timeLeft === 0 && phase === 'playing') {
      const xp = score * XP_PER_CORRECT;
      scoresApi.submit('survie', lessonId, score).catch(() => {});
      revisionApi.submitAttempts(attemptsRef.current).catch(() => {});
      if (xp > 0) {
        progressApi.awardXp(xp).catch(() => {});
        addXp(xp);
      }
      setPhase('result');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  function handleSelect(id: string) {
    if (selectedId !== null || !question || phase !== 'playing') return;
    setSelectedId(id);

    const isCorrect = id === question.correctId;
    attemptsRef.current.push({ signId: question.target.id, isCorrect });
    if (isCorrect) {
      setScore((s) => s + 1);
      setTimeLeft((t) => t + TIME_BONUS);
      setBonusKey((k) => k + 1);
      setTimeout(() => pickNext(signsRef.current), 500);
    } else {
      setTimeout(() => pickNext(signsRef.current), 700);
    }
  }

  const handleRestart = useCallback(() => {
    if (!lesson) return;
    poolRef.current = [...lesson.signs].sort(() => Math.random() - 0.5);
    const target = poolRef.current.pop()!;
    setQuestion(buildQuestion(target, lesson.signs));
    setSelectedId(null);
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setPhase('playing');
    setBonusKey(0);
    attemptsRef.current = [];
  }, [lesson]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lesson || !question) return null;

  // ─── Résultats ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const feedback =
      score >= 20 ? 'Incroyable !' :
      score >= 10 ? 'Très bien !' :
      score >= 5  ? 'Pas mal !' :
                    "Continue à t'entraîner !";

    return (
      <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-cyan-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px]" />

        <div className="relative max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8 py-8"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500">
                <Trophy className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{feedback}</h2>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-7xl font-black text-white">{score}</span>
              <span className="text-white/40 text-sm">
                bonne{score !== 1 ? 's' : ''} réponse{score !== 1 ? 's' : ''}
              </span>
            </div>

            {score > 0 && (
              <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-amber-400/10 border border-amber-400/20">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-semibold text-sm">+{score * XP_PER_CORRECT} XP gagnés</span>
              </div>
            )}

            <div className="w-full max-w-xs">
              <Leaderboard game="survie" lessonId={lessonId} unit="réponses" />
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
                href="/jeux/survie"
                className="flex items-center justify-center w-full px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
              >
                Changer de leçon
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Jeu ─────────────────────────────────────────────────────────────────────
  const isAnswered = selectedId !== null;
  const isLow = timeLeft <= 10;

  function getChoiceStyle(id: string, q: Question): string {
    const base = 'w-full px-4 py-3 rounded-2xl border text-sm font-semibold text-left transition-all duration-150';
    if (!isAnswered) {
      return `${base} bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/25 cursor-pointer`;
    }
    if (id === q.correctId) {
      return `${base} bg-emerald-500/15 border-emerald-500/40 text-emerald-300 cursor-default`;
    }
    if (id === selectedId) {
      return `${base} bg-rose-500/15 border-rose-500/40 text-rose-300 cursor-default`;
    }
    return `${base} bg-white/3 border-white/5 text-white/30 cursor-default`;
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-10 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-cyan-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px]" />

      <div className="relative max-w-xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/jeux/survie"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </Link>
          <span className="text-white/30 text-xs font-medium">{lesson.title}</span>
        </div>

        {/* Timer + score */}
        <div className="flex flex-col items-center gap-3 relative">
          {/* Bonus +5s animation */}
          <AnimatePresence>
            {bonusKey > 0 && (
              <motion.div
                key={bonusKey}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -48 }}
                exit={{}}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 text-emerald-400 font-bold text-xl pointer-events-none select-none"
              >
                +{TIME_BONUS}s
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`flex items-center gap-2 transition-colors ${isLow ? 'text-rose-400' : 'text-white'}`}>
            <Timer className={`w-5 h-5 ${isLow ? 'animate-pulse' : ''}`} />
            <span className={`text-5xl font-black tabular-nums ${isLow ? 'animate-pulse' : ''}`}>
              {timeLeft}
            </span>
            <span className="text-white/30 text-lg font-medium self-end mb-1">s</span>
          </div>

          {/* Timer bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors ${isLow ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
              animate={{ width: `${Math.min(100, (timeLeft / INITIAL_TIME) * 100)}%` }}
              transition={{ duration: 0.9, ease: 'linear' }}
            />
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 self-end">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-sm font-semibold tabular-nums">{score}</span>
          </div>
        </div>

        {/* Signe à deviner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.target.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="aspect-square max-h-72 w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5"
          >
            <SignMedia sign={question.target} />
          </motion.div>
        </AnimatePresence>

        {/* Choix de mots */}
        <div className="flex flex-col gap-2">
          {question.choices.map((sign) => (
            <button
              key={sign.id}
              onClick={() => handleSelect(sign.id)}
              className={getChoiceStyle(sign.id, question)}
              disabled={isAnswered}
            >
              {sign.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

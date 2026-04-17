'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SignMedia } from '@/components/signs/SignMedia';
import { ChevronLeft, Timer, Zap, Trophy, RefreshCw, Star } from 'lucide-react';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { lessonsApi } from '@/lib/api/lessons';
import { progressApi, type CompleteLessonResponse } from '@/lib/api/progress';
import { scoresApi } from '@/lib/api/scores';
import { revisionApi } from '@/lib/api/revision';
import type { LessonDetail, SignInLesson } from '@/lib/types';

interface VitesseQuestion {
  sign: SignInLesson;
  choices: string[];
  correctAnswer: string;
}

function generateQuestions(signs: SignInLesson[]): VitesseQuestion[] {
  const shuffled = [...signs].sort(() => Math.random() - 0.5);
  return shuffled.map((sign) => {
    const wrong = signs
      .filter((s) => s.id !== sign.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((s) => s.word);
    const choices = [...wrong, sign.word].sort(() => Math.random() - 0.5);
    return { sign, choices, correctAnswer: sign.word };
  });
}

function calcPoints(ms: number, isCorrect: boolean): number {
  if (!isCorrect) return 0;
  if (ms < 3000) return 3;
  if (ms < 6000) return 2;
  if (ms < 10000) return 1;
  return 0;
}

type Phase = 'playing' | 'result';

function useStopwatch() {
  const [ms, setMs] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    ref.current = setInterval(() => setMs((v) => v + 100), 100);
  }
  function stop() {
    if (ref.current) clearInterval(ref.current);
  }
  function reset() {
    if (ref.current) clearInterval(ref.current);
    setMs(0);
  }

  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);

  return { ms, start, stop, reset };
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export default function VitessePage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<VitesseQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [completion, setCompletion] = useState<CompleteLessonResponse | null>(null);
  const attemptsRef = useRef<{ signId: string; isCorrect: boolean }[]>([]);

  // Timer total
  const total = useStopwatch();
  // Mini chrono par question
  const question = useStopwatch();
  const questionStartRef = useRef(0);

  useEffect(() => {
    lessonsApi.getById(lessonId)
      .then((data) => {
        setLesson(data);
        setQuestions(generateQuestions(data.signs));
      })
      .catch(() => router.push('/jeux/vitesse'))
      .finally(() => setIsLoading(false));
  }, [lessonId, router]);

  // Démarre les chronomètres quand le jeu commence
  useEffect(() => {
    if (!isLoading && phase === 'playing' && questions.length > 0) {
      total.start();
      question.start();
      questionStartRef.current = Date.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, questions.length]);

  function handleSelect(choice: string) {
    if (selectedAnswer !== null) return;
    question.stop();
    const elapsed = Date.now() - questionStartRef.current;
    const isCorrect = choice === questions[currentIndex].correctAnswer;
    const pts = calcPoints(elapsed, isCorrect);
    setScore((s) => s + pts);
    setSelectedAnswer(choice);
    attemptsRef.current.push({ signId: questions[currentIndex].sign.id, isCorrect });
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      total.stop();
      const finalScore = score;
      progressApi.completeLesson(lessonId, finalScore, questions.length * 3)
        .then(setCompletion)
        .catch(() => {});
      scoresApi.submit('vitesse', lessonId, finalScore).catch(() => {});
      revisionApi.submitAttempts(attemptsRef.current).catch(() => {});
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      question.reset();
      question.start();
      questionStartRef.current = Date.now();
    }
  }

  const handleRestart = useCallback(() => {
    if (!lesson) return;
    setQuestions(generateQuestions(lesson.signs));
    setCurrentIndex(0);
    setScore(0);
    setPhase('playing');
    setSelectedAnswer(null);
    setCompletion(null);
    total.reset();
    question.reset();
    attemptsRef.current = [];
    setTimeout(() => {
      total.start();
      question.start();
      questionStartRef.current = Date.now();
    }, 50);
  }, [lesson, total, question]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lesson) return null;

  // ─── Résultats ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const maxScore = questions.length * 3;
    const percent = Math.round((score / maxScore) * 100);
    const xpEarned = completion?.xpEarned ?? Math.round((score / maxScore) * lesson.xpReward);
    const feedback =
      percent === 100 ? 'Parfait !' :
      percent >= 75   ? 'Excellent !' :
      percent >= 50   ? 'Pas mal !' :
                        'Continue à t\'entraîner !';

    return (
      <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-amber-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-[120px]" />

        <div className="relative max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8 py-8"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
                <Trophy className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{feedback}</h2>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-7xl font-black text-white">
                {score}<span className="text-white/30 text-4xl">/{maxScore}</span>
              </span>
              <span className="text-white/40 text-sm">{percent}% des points</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <Timer className="w-5 h-5 text-amber-400" />
                <span className="text-white/70 text-sm font-medium">{formatTime(total.ms)}</span>
                <span className="text-white/30 text-xs">Temps total</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-center gap-1">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-white/70 text-sm font-medium">{questions.length}</span>
                <span className="text-white/30 text-xs">Questions</span>
              </div>
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
              <Leaderboard game="vitesse" lessonId={lessonId} unit="pts" />
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
                className="flex items-center justify-center w-full px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
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
  const isAnswered = selectedAnswer !== null;

  function getChoiceStyle(choice: string): string {
    const base = 'flex items-center justify-center px-4 py-4 rounded-2xl border text-sm font-medium transition-all duration-200 text-center';
    if (!isAnswered) {
      return `${base} bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 cursor-pointer`;
    }
    if (choice === q.correctAnswer) {
      return `${base} bg-emerald-500/15 border-emerald-500/40 text-emerald-300 cursor-default`;
    }
    if (choice === selectedAnswer) {
      return `${base} bg-rose-500/15 border-rose-500/40 text-rose-300 cursor-default`;
    }
    return `${base} bg-white/5 border-white/5 text-white/20 cursor-default`;
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-amber-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-[120px]" />

      <div className="relative max-w-xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <Link
            href={`/jeux/vitesse`}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </Link>
          {/* Timers */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/70 text-xs font-mono">{formatTime(total.ms)}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-xs font-mono font-bold">{(question.ms / 1000).toFixed(1)}s</span>
            </div>
          </div>
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
              <span className="text-amber-400 font-semibold">{score} pts</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                initial={{ width: `${(currentIndex / questions.length) * 100}%` }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Media */}
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden max-w-sm mx-auto w-full">
            <SignMedia sign={q.sign} />
          </div>

          <p className="text-center text-white/50 text-sm">Quel est ce signe ?</p>

          {/* Choix */}
          <div className="grid grid-cols-2 gap-3">
            {q.choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleSelect(choice)}
                className={getChoiceStyle(choice)}
              >
                {choice}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4"
            >
              <p className={`text-sm font-medium ${selectedAnswer === q.correctAnswer ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedAnswer === q.correctAnswer
                  ? 'Bonne réponse !'
                  : `La bonne réponse était : ${q.correctAnswer}`}
              </p>
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
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

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SignMedia } from '@/components/signs/SignMedia';
import { ChevronLeft, Trophy, RefreshCw, CheckCircle2, XCircle, AlertCircle, Star } from 'lucide-react';
import { lessonsApi } from '@/lib/api/lessons';
import { revisionApi, type RevisionSign } from '@/lib/api/revision';
import { progressApi } from '@/lib/api/progress';
import { useProgressStore } from '@/store/progressStore';
import type { LessonDetail } from '@/lib/types';

const XP_PER_CORRECT = 4;

interface Question {
  target: RevisionSign;
  choices: RevisionSign[];
  correctId: string;
}

function buildQuestion(target: RevisionSign, allSigns: RevisionSign[]): Question {
  const wrong = allSigns
    .filter((s) => s.id !== target.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [...wrong, target].sort(() => Math.random() - 0.5);
  return { target, choices, correctId: target.id };
}

function generateQuestions(signs: RevisionSign[]): Question[] {
  // Trie les signes par taux d'erreur décroissant (déjà fait côté serveur, mais on reshufle légèrement)
  return signs.map((sign) => buildQuestion(sign, signs));
}

type Phase = 'playing' | 'result';

export default function RevisionPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNoData, setHasNoData] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addXp = useProgressStore((s) => s.addXp);
  const attemptsRef = useRef<{ signId: string; isCorrect: boolean }[]>([]);

  useEffect(() => {
    Promise.all([
      lessonsApi.getById(lessonId),
      revisionApi.getSignsForLesson(lessonId),
    ])
      .then(([lessonData, revisionSigns]) => {
        setLesson(lessonData);
        if (revisionSigns.length < 2) {
          setHasNoData(true);
        } else {
          setQuestions(generateQuestions(revisionSigns));
        }
      })
      .catch(() => router.push('/jeux/revision'))
      .finally(() => setIsLoading(false));
  }, [lessonId, router]);

  function handleSelect(id: string) {
    if (selectedId !== null || !questions[currentIndex]) return;
    setSelectedId(id);
    const isCorrect = id === questions[currentIndex].correctId;
    if (isCorrect) setScore((s) => s + 1);
    attemptsRef.current.push({ signId: questions[currentIndex].target.id, isCorrect });
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      const xp = score * XP_PER_CORRECT;
      revisionApi.submitAttempts(attemptsRef.current).catch(() => {});
      if (xp > 0) {
        progressApi.awardXp(xp).catch(() => {});
        addXp(xp);
      }
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedId(null);
    }
  }

  const handleRestart = useCallback(() => {
    if (!questions.length) return;
    const reshuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(reshuffled);
    setCurrentIndex(0);
    setScore(0);
    setPhase('playing');
    setSelectedId(null);
    attemptsRef.current = [];
  }, [questions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lesson) return null;

  // ─── Pas encore de données d'erreurs ──────────────────────────────────────────
  if (hasNoData) {
    return (
      <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden flex flex-col items-center justify-center gap-6">
        <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-orange-700/15 blur-[120px]" />
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Pas encore d&apos;erreurs !</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Joue d&apos;abord d&apos;autres modes sur cette leçon. La révision affichera les signes sur lesquels tu t&apos;es trompé.
          </p>
          <Link
            href="/jeux/revision"
            className="mt-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
          >
            Changer de leçon
          </Link>
        </div>
      </div>
    );
  }

  // ─── Résultats ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const percent = Math.round((score / questions.length) * 100);
    const feedback =
      percent === 100 ? 'Plus d\'erreurs !' :
      percent >= 75   ? 'Bien mieux !' :
      percent >= 50   ? 'Continue !' :
                        'Reviens y demain !';

    return (
      <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-orange-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-red-600/15 blur-[120px]" />

        <div className="relative max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8 py-8"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500">
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

            {score > 0 && (
              <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-amber-400/10 border border-amber-400/20">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-semibold text-sm">+{score * XP_PER_CORRECT} XP gagnés</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
              <button
                onClick={handleRestart}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Recommencer
              </button>
              <Link
                href="/jeux/revision"
                className="flex items-center justify-center w-full px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
              >
                Changer de leçon
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Jeu ──────────────────────────────────────────────────────────────────────
  const q = questions[currentIndex];
  const isAnswered = selectedId !== null;

  function getChoiceStyle(id: string): string {
    const base = 'w-full px-4 py-3 rounded-2xl border text-sm font-semibold text-left transition-all duration-150';
    if (!isAnswered) {
      return `${base} bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/25 cursor-pointer`;
    }
    if (id === q.correctId) return `${base} bg-emerald-500/15 border-emerald-500/40 text-emerald-300 cursor-default`;
    if (id === selectedId) return `${base} bg-rose-500/15 border-rose-500/40 text-rose-300 cursor-default`;
    return `${base} bg-white/3 border-white/5 text-white/30 cursor-default`;
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-10 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-orange-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-red-600/15 blur-[120px]" />

      <div className="relative max-w-xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/jeux/revision"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </Link>
          <span className="text-white/30 text-xs font-medium">{lesson.title} — Révision</span>
        </div>

        {/* Progress + badge erreur */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/30">
            <span>Signe {currentIndex + 1} / {questions.length}</span>
            <span className="text-orange-400 font-medium">
              {q.target.wrongCount} erreur{q.target.wrongCount > 1 ? 's' : ''} passée{q.target.wrongCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
              initial={{ width: `${(currentIndex / questions.length) * 100}%` }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Image du signe */}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.target.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="aspect-square max-h-72 w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5"
          >
            <SignMedia sign={q.target as any} />
          </motion.div>
        </AnimatePresence>

        {/* Choix */}
        <div className="flex flex-col gap-2">
          {q.choices.map((sign) => (
            <button
              key={sign.id}
              onClick={() => handleSelect(sign.id)}
              className={getChoiceStyle(sign.id)}
              disabled={isAnswered}
            >
              {sign.word}
            </button>
          ))}
        </div>

        {/* Feedback + next */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-4"
          >
            <div className={`flex items-center gap-2 text-sm font-medium ${selectedId === q.correctId ? 'text-emerald-400' : 'text-rose-400'}`}>
              {selectedId === q.correctId ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {selectedId === q.correctId ? 'Bonne réponse !' : `La bonne réponse était : ${q.target.word}`}
            </div>
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
            >
              {currentIndex + 1 === questions.length ? 'Voir les résultats' : 'Signe suivant'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

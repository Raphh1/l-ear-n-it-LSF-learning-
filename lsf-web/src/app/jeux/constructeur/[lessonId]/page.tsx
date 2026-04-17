'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RefreshCw, Star, Trophy, Check, X } from 'lucide-react';
import { phrasesApi } from '@/lib/api/phrases';
import { scoresApi } from '@/lib/api/scores';
import { progressApi, type CompleteLessonResponse } from '@/lib/api/progress';
import type { PhraseLesson, Phrase, SignInPhrase } from '@/lib/types';

// Mélange un tableau
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Phase = 'playing' | 'result';
type AnswerState = 'idle' | 'correct' | 'wrong';

function PhraseExercise({
  phrase,
  index,
  total,
  onResult,
}: {
  phrase: Phrase;
  index: number;
  total: number;
  onResult: (correct: boolean) => void;
}) {
  const [pool, setPool] = useState<SignInPhrase[]>(() => shuffle(phrase.signs));
  const [built, setBuilt] = useState<SignInPhrase[]>([]);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');

  // Réinitialise quand la phrase change
  useEffect(() => {
    setPool(shuffle(phrase.signs));
    setBuilt([]);
    setAnswerState('idle');
  }, [phrase]);

  function pickSign(sign: SignInPhrase) {
    if (answerState !== 'idle') return;
    setPool((p) => p.filter((s) => s.id !== sign.id));
    setBuilt((b) => [...b, sign]);
  }

  function removeSign(sign: SignInPhrase) {
    if (answerState !== 'idle') return;
    setBuilt((b) => b.filter((s) => s.id !== sign.id));
    setPool((p) => [...p, sign]);
  }

  function checkAnswer() {
    const correct = built.every((s, i) => s.id === phrase.signs[i].id) && built.length === phrase.signs.length;
    setAnswerState(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 900);
  }

  function reset() {
    setPool(shuffle(phrase.signs));
    setBuilt([]);
    setAnswerState('idle');
  }

  const canCheck = built.length === phrase.signs.length && answerState === 'idle';

  return (
    <motion.div
      key={phrase.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Progression */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-white/30">
          <span>Phrase {index + 1} / {total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: `${(index / total) * 100}%` }}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Phrase en français */}
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 flex flex-col gap-2">
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">En français</p>
        <p className="text-white text-lg font-semibold">{phrase.textFr}</p>
        <p className="text-white/30 text-xs">Construis cette phrase en LSF dans le bon ordre.</p>
      </div>

      {/* Zone de construction */}
      <div className="flex flex-col gap-2">
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Ta réponse</p>
        <div
          className={`min-h-[80px] rounded-2xl border px-4 py-3 flex flex-wrap gap-3 items-center transition-colors ${
            answerState === 'correct'
              ? 'border-emerald-500/50 bg-emerald-500/10'
              : answerState === 'wrong'
              ? 'border-rose-500/50 bg-rose-500/10'
              : 'border-white/10 bg-white/5'
          }`}
        >
          {built.length === 0 ? (
            <p className="text-white/20 text-sm">Clique sur les signes ci-dessous pour construire la phrase…</p>
          ) : (
            built.map((sign, i) => (
              <motion.button
                key={`${sign.id}-${i}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15 }}
                onClick={() => removeSign(sign)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 bg-white/10 group-hover:border-rose-400/40 transition-colors relative">
                  {sign.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sign.thumbnailUrl} alt={sign.word} className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-white/30 text-xs">{sign.word[0]}</span>
                  )}
                  <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/10 transition-colors rounded-xl" />
                </div>
                <span className="text-white text-xs font-medium capitalize">{sign.word}</span>
              </motion.button>
            ))
          )}
        </div>
        {answerState === 'correct' && (
          <p className="text-emerald-400 text-sm font-medium flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Bonne réponse !
          </p>
        )}
        {answerState === 'wrong' && (
          <div className="flex flex-col gap-1">
            <p className="text-rose-400 text-sm font-medium flex items-center gap-1.5">
              <X className="w-4 h-4" /> Pas tout à fait…
            </p>
            <p className="text-white/40 text-xs">
              Ordre correct : {phrase.signs.map((s) => s.word).join(' → ')}
            </p>
          </div>
        )}
      </div>

      {/* Pool de signes disponibles */}
      <div className="flex flex-col gap-2">
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Signes disponibles</p>
        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {pool.map((sign) => (
              <motion.button
                key={sign.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => pickSign(sign)}
                disabled={answerState !== 'idle'}
                className="flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/15 bg-white/5 group-hover:border-teal-400/50 group-hover:bg-white/10 transition-all relative">
                  {sign.thumbnailUrl || sign.gifUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sign.thumbnailUrl ?? sign.gifUrl!}
                      data-gif={sign.gifUrl ?? undefined}
                      data-thumb={sign.thumbnailUrl ?? undefined}
                      alt={sign.word}
                      className="w-full h-full object-cover"
                      onMouseEnter={(e) => { const g = e.currentTarget.dataset.gif; if (g) e.currentTarget.src = g; }}
                      onMouseLeave={(e) => { const t = e.currentTarget.dataset.thumb; if (t) e.currentTarget.src = t; }}
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-white/30 text-xs">{sign.word[0]}</span>
                  )}
                </div>
                <span className="text-white/70 text-xs font-medium capitalize group-hover:text-white transition-colors">{sign.word}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={reset}
          disabled={answerState !== 'idle'}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-sm hover:bg-white/10 hover:text-white/70 transition-all disabled:opacity-30"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Réinitialiser
        </button>
        <button
          onClick={checkAnswer}
          disabled={!canCheck}
          className="flex-1 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Vérifier
        </button>
      </div>
    </motion.div>
  );
}

export default function ConstructeurPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<PhraseLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [completion, setCompletion] = useState<CompleteLessonResponse | null>(null);

  useEffect(() => {
    phrasesApi.getByLesson(lessonId)
      .then(setLesson)
      .catch(() => router.push('/jeux'))
      .finally(() => setIsLoading(false));
  }, [lessonId, router]);

  function handleResult(correct: boolean) {
    if (correct) setScore((s) => s + 1);
    if (!lesson) return;

    if (currentIndex + 1 >= lesson.phrases.length) {
      const finalScore = correct ? score + 1 : score;
      const pct = Math.round((finalScore / lesson.phrases.length) * 100);
      progressApi.completeLesson(lessonId, finalScore, lesson.phrases.length)
        .then(setCompletion)
        .catch(() => {});
      scoresApi.submit('constructeur', lessonId, pct).catch(() => {});
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setPhase('playing');
    setCompletion(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lesson) return null;

  // ─── Résultats ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const total = lesson.phrases.length;
    const pct = Math.round((score / total) * 100);
    const xpEarned = completion?.xpEarned ?? Math.round((score / total) * lesson.xpReward);
    const feedback =
      pct === 100 ? 'Parfait !' :
      pct >= 75   ? 'Excellent !' :
      pct >= 50   ? 'Pas mal !' :
                    'Continue à t\'entraîner !';

    return (
      <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-600/15 blur-[120px]" />

        <div className="relative max-w-lg mx-auto">
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
                {score}<span className="text-white/30 text-4xl">/{total}</span>
              </span>
              <span className="text-white/40 text-sm">{pct}% de bonnes réponses</span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-400/10 border border-emerald-400/20">
              <Star className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-sm">+{xpEarned} XP gagnés</span>
            </div>
            {completion?.isFirstCompletion && (
              <span className="text-emerald-400 text-xs font-medium">
                Première complétion — XP enregistrés !
              </span>
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
                href="/jeux"
                className="flex items-center justify-center w-full px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
              >
                Retour aux jeux
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Jeu ─────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-600/15 blur-[120px]" />

      <div className="relative max-w-lg mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-1"
        >
          <Link
            href="/jeux"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            Jeux
          </Link>
          <h1 className="text-2xl font-bold text-white mt-3">{lesson.title}</h1>
          <p className="text-white/30 text-sm">Constructeur de phrases</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <PhraseExercise
            key={currentIndex}
            phrase={lesson.phrases[currentIndex]}
            index={currentIndex}
            total={lesson.phrases.length}
            onResult={handleResult}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

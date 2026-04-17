'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SignMedia } from '@/components/signs/SignMedia';
import { ChevronLeft, Trophy, RefreshCw } from 'lucide-react';
import { lessonsApi } from '@/lib/api/lessons';
import { progressApi } from '@/lib/api/progress';
import { scoresApi } from '@/lib/api/scores';
import type { LessonDetail, SignInLesson } from '@/lib/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type CardType = 'image' | 'word';

interface MemoryCard {
  id: string;        // unique card id
  pairId: string;    // sign id — même pairId pour les 2 cartes d'une paire
  type: CardType;
  sign: SignInLesson;
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function buildCards(signs: SignInLesson[]): MemoryCard[] {
  const limited = signs.slice(0, 8);
  const cards: MemoryCard[] = [];
  limited.forEach((sign) => {
    cards.push({ id: `img-${sign.id}`,  pairId: sign.id, type: 'image', sign });
    cards.push({ id: `word-${sign.id}`, pairId: sign.id, type: 'word',  sign });
  });
  return cards.sort(() => Math.random() - 0.5);
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Card component ───────────────────────────────────────────────────────────

interface MemoryCardProps {
  card: MemoryCard;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

function MemCardFace({ card }: { card: MemoryCard }) {
  if (card.type === 'word') {
    return (
      <div className="w-full h-full flex items-center justify-center p-2">
        <span className="text-white font-bold text-center leading-tight text-sm sm:text-base break-words">
          {card.sign.word}
        </span>
      </div>
    );
  }
  // image
  return <SignMedia sign={card.sign} />;
}

function MemCard({ card, isFlipped, isMatched, onClick }: MemoryCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={isFlipped || isMatched}
      className="relative aspect-square w-full"
      style={{ perspective: 600 }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {/* Face cachée */}
        <div
          className="absolute inset-0 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-2xl opacity-30">🤟</span>
        </div>

        {/* Face visible */}
        <div
          className={`absolute inset-0 rounded-2xl border overflow-hidden transition-colors duration-300 ${
            isMatched
              ? 'border-emerald-500/50 bg-emerald-500/10'
              : 'border-white/20 bg-white/8'
          }`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <MemCardFace card={card} />
          {isMatched && (
            <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/60 pointer-events-none" />
          )}
        </div>
      </motion.div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Phase = 'playing' | 'result';

export default function MemoirePage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);   // ids des cartes retournées (max 2)
  const [matched, setMatched] = useState<Set<string>>(new Set()); // ids des cartes matchées
  const [moves, setMoves] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [seconds, setSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    lessonsApi.getById(lessonId)
      .then((data) => {
        setLesson(data);
        setCards(buildCards(data.signs));
      })
      .catch(() => router.push('/jeux/memoire'))
      .finally(() => setIsLoading(false));
  }, [lessonId, router]);

  // Démarre le chrono
  useEffect(() => {
    if (!isLoading && phase === 'playing') {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLoading, phase]);

  function handleCardClick(cardId: string) {
    if (isLocked) return;
    if (flipped.includes(cardId)) return;
    if (matched.has(cardId)) return;

    const newFlipped = [...flipped, cardId];

    if (newFlipped.length === 1) {
      setFlipped(newFlipped);
      return;
    }

    // 2ème carte
    setFlipped(newFlipped);
    setMoves((m) => m + 1);
    setIsLocked(true);

    const [id1, id2] = newFlipped;
    const c1 = cards.find((c) => c.id === id1)!;
    const c2 = cards.find((c) => c.id === id2)!;

    if (c1.pairId === c2.pairId) {
      // Match !
      const newMatched = new Set(matched);
      newMatched.add(id1);
      newMatched.add(id2);
      setMatched(newMatched);
      setFlipped([]);
      setIsLocked(false);

      // Victoire ?
      if (newMatched.size === cards.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        const pairs = cards.length / 2;
        progressApi.completeLesson(lessonId, pairs, pairs).catch(() => {});
        scoresApi.submit('memoire', lessonId, pairs).catch(() => {});
        setPhase('result');
      }
    } else {
      // Pas de match → retourner après 1s
      setTimeout(() => {
        setFlipped([]);
        setIsLocked(false);
      }, 1000);
    }
  }

  const handleRestart = useCallback(() => {
    if (!lesson) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setCards(buildCards(lesson.signs));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setSeconds(0);
    setPhase('playing');
    setIsLocked(false);
  }, [lesson]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lesson) return null;

  const totalPairs = cards.length / 2;

  // ─── Résultats ─────────────────────────────────────────────────────────────
  if (phase === 'result') {
    return (
      <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-rose-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-pink-600/15 blur-[120px]" />

        <div className="relative max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8 py-8"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-500">
                <Trophy className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Félicitations !</h2>
              <p className="text-white/40 text-sm">Toutes les paires trouvées</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl border border-white/10 bg-white/5">
                <span className="text-4xl font-black text-white">{moves}</span>
                <span className="text-white/40 text-xs">Coups</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl border border-white/10 bg-white/5">
                <span className="text-4xl font-black text-white">{formatTime(seconds)}</span>
                <span className="text-white/40 text-xs">Temps</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-rose-400/10 border border-rose-400/20">
              <span className="text-rose-400 font-semibold text-sm">{totalPairs} paires trouvées</span>
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
                className="flex items-center justify-center w-full px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
              >
                Retour à la leçon
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Jeu ───────────────────────────────────────────────────────────────────
  const matchedPairs = matched.size / 2;

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-rose-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-pink-600/15 blur-[120px]" />

      <div className="relative max-w-3xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/jeux/memoire`}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </Link>
            <h1 className="text-xl font-bold text-white mt-1">{lesson.title}</h1>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-white/70 text-sm font-semibold">{formatTime(seconds)}</span>
              <span className="text-white/30 text-xs">Temps</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white/70 text-sm font-semibold">{moves}</span>
              <span className="text-white/30 text-xs">Coups</span>
            </div>
          </div>
        </motion.div>

        {/* Progress paires */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/30">
            <span>Paires trouvées</span>
            <span className="text-rose-400 font-semibold">{matchedPairs} / {totalPairs}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
              animate={{ width: `${(matchedPairs / totalPairs) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Grille */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-3 sm:grid-cols-4 gap-3"
          >
            {cards.map((card) => (
              <MemCard
                key={card.id}
                card={card}
                isFlipped={flipped.includes(card.id)}
                isMatched={matched.has(card.id)}
                onClick={() => handleCardClick(card.id)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

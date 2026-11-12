'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GameEnd, GameHeader, GameProgress } from '@/components/brand/Game';
import { Loader } from '@/components/brand/Loader';
import { SignMedia } from '@/components/signs/SignMedia';
import { RefreshCw, Hand } from 'lucide-react';
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
        <span className="break-words text-center font-display text-base font-extrabold capitalize leading-tight sm:text-xl">
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
          className="absolute inset-0 flex items-center justify-center border-[3px] border-ink bg-tomato shadow-hard"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Hand className="h-8 w-8" strokeWidth={2.5} />
        </div>

        {/* Face visible */}
        <div
          className={`absolute inset-0 overflow-hidden border-[3px] border-ink transition-colors duration-300 ${
            isMatched ? 'bg-mint' : 'bg-white shadow-hard'
          }`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <MemCardFace card={card} />
          {isMatched && (
            <div className="pointer-events-none absolute inset-0 border-[5px] border-mint" />
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

  if (isLoading) return <Loader label="Mélange des cartes..." />;

  if (!lesson) return null;

  const totalPairs = cards.length / 2;

  // ─── Résultats ─────────────────────────────────────────────────────────────
  if (phase === 'result') {
    return (
      <div className="px-6 py-14">
        <div className="mx-auto max-w-xl">
          <GameEnd
            title="Félicitations !"
            color="bg-tomato"
            subtitle="Toutes les paires trouvées"
            extra={
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: moves, label: 'Coups' },
                  { value: formatTime(seconds), label: 'Temps' },
                  { value: totalPairs, label: 'Paires' },
                ].map(s => (
                  <div key={s.label} className="panel-flat flex flex-col items-center gap-1 px-5 py-4">
                    <span className="font-display text-4xl font-extrabold">{s.value}</span>
                    <span className="text-sm font-bold">{s.label}</span>
                  </div>
                ))}
              </div>
            }
          >
            <button onClick={handleRestart} className="btn flex-1"><RefreshCw className="h-5 w-5" /> Recommencer</button>
            <Link href={`/lessons/${lessonId}`} className="btn btn-ink flex-1">Retour à la leçon</Link>
          </GameEnd>
        </div>
      </div>
    );
  }

  // ─── Jeu ───────────────────────────────────────────────────────────────────
  const matchedPairs = matched.size / 2;

  return (
    <div className="px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-7">
        <GameHeader
          backHref="/jeux/memoire"
          backLabel="Retour"
          title="Mémoire"
          right={<span className="flex gap-3"><span>{formatTime(seconds)}</span><span>{moves} coups</span></span>}
        />

        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-bold">
            <span>{lesson.title}</span>
            <span>{matchedPairs} / {totalPairs} paires</span>
          </div>
          <GameProgress value={(matchedPairs / totalPairs) * 100} color="bg-mint" />
        </div>

        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {cards.map((card) => (
            <MemCard
              key={card.id}
              card={card}
              isFlipped={flipped.includes(card.id)}
              isMatched={matched.has(card.id)}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

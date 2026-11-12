'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SignMedia } from '@/components/signs/SignMedia';
import { GameEnd, GameHeader } from '@/components/brand/Game';
import { Loader } from '@/components/brand/Loader';
import { RefreshCw, Star, Timer } from 'lucide-react';
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

  if (isLoading) return <Loader label="Prépare-toi..." />;

  if (!lesson || !question) return null;

  // ─── Résultats ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const feedback =
      score >= 20 ? 'Incroyable !' :
      score >= 10 ? 'Très bien !' :
      score >= 5  ? 'Pas mal !' :
                    "Continue à t'entraîner !";

    return (
      <div className="px-6 py-14">
        <div className="mx-auto max-w-xl">
          <GameEnd
            title={feedback}
            color="bg-tomato"
            subtitle={
              <span className="flex flex-col items-center">
                <span className="font-display text-8xl font-extrabold leading-none">{score}</span>
                <span>bonne{score !== 1 ? 's' : ''} réponse{score !== 1 ? 's' : ''}</span>
              </span>
            }
            xp={score * XP_PER_CORRECT}
            extra={
              <div className="panel w-full max-w-sm p-4 text-left">
                <Leaderboard game="survie" lessonId={lessonId} unit="réponses" />
              </div>
            }
          >
            <button onClick={handleRestart} className="btn flex-1"><RefreshCw className="h-5 w-5" /> Recommencer</button>
            <Link href="/jeux/survie" className="btn btn-ink flex-1">Changer de leçon</Link>
          </GameEnd>
        </div>
      </div>
    );
  }

  // ─── Jeu ─────────────────────────────────────────────────────────────────────
  const isAnswered = selectedId !== null;
  const isLow = timeLeft <= 10;

  function choiceClass(id: string, q: Question): string {
    const base = 'choice w-full justify-start text-left';
    if (!isAnswered) return base;
    if (id === q.correctId) return `${base} choice-correct`;
    if (id === selectedId) return `${base} choice-wrong`;
    return `${base} choice-dim`;
  }

  return (
    <div className={`min-h-[calc(100vh-4rem)] px-6 py-10 transition-colors ${isLow ? 'bg-tomato' : ''}`}>
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <GameHeader backHref="/jeux/survie" backLabel="Retour" title="Survie" right={<span className="flex items-center gap-1"><Star className="h-5 w-5 fill-sun" /> {score}</span>} />

        {/* Chrono */}
        <div className="relative flex flex-col items-center gap-3">
          <AnimatePresence>
            {bonusKey > 0 && (
              <motion.span
                key={bonusKey}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -48 }}
                exit={{}}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="tile pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 select-none bg-mint text-xl"
              >
                +{TIME_BONUS}s
              </motion.span>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            <Timer className="mb-2 h-7 w-7" strokeWidth={2.5} />
            <span className="font-display text-7xl font-extrabold leading-none tabular-nums">{timeLeft}</span>
            <span className="mb-1 font-display text-2xl font-extrabold">s</span>
          </div>

          <div className="bar h-5 w-full">
            <span className={isLow ? 'bg-ink' : 'bg-sun'} style={{ width: `${Math.min(100, (timeLeft / INITIAL_TIME) * 100)}%`, transition: 'width 0.9s linear' }} />
          </div>
        </div>

        <div key={question.target.id} className="video-frame mx-auto aspect-square w-full max-w-72">
          <SignMedia sign={question.target} />
        </div>

        <div className="flex flex-col gap-3">
          {question.choices.map((sign) => (
            <button key={sign.id} onClick={() => handleSelect(sign.id)} className={choiceClass(sign.id, question)} disabled={isAnswered}>
              {sign.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

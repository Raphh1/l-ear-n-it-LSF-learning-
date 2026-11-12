'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignMedia } from '@/components/signs/SignMedia';
import { Timer, Zap, RefreshCw, ArrowRight } from 'lucide-react';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { lessonsApi } from '@/lib/api/lessons';
import { progressApi, type CompleteLessonResponse } from '@/lib/api/progress';
import { scoresApi } from '@/lib/api/scores';
import { revisionApi } from '@/lib/api/revision';
import { GameEnd, GameHeader, GameProgress } from '@/components/brand/Game';
import { Loader } from '@/components/brand/Loader';
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

  if (isLoading) return <Loader label="Prépare-toi..." />;

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
      <div className="px-6 py-14">
        <div className="mx-auto max-w-xl">
          <GameEnd
            title={feedback}
            color="bg-tomato"
            subtitle={<span className="font-display text-7xl font-extrabold">{score}<span className="text-4xl text-ink/50">/{maxScore}</span></span>}
            xp={xpEarned}
            extra={
              <>
                <div className="flex gap-4">
                  <span className="sticker bg-white text-sm"><Timer className="h-4 w-4" /> {formatTime(total.ms)}</span>
                  <span className="sticker bg-white text-sm"><Zap className="h-4 w-4" /> {questions.length} questions</span>
                  <span className="sticker bg-white text-sm">{percent}% des points</span>
                </div>
                {completion?.isFirstCompletion && <span className="sticker bg-mint">Première complétion : XP enregistrés !</span>}
                <div className="panel w-full max-w-sm p-4 text-left">
                  <Leaderboard game="vitesse" lessonId={lessonId} unit="pts" />
                </div>
              </>
            }
          >
            <button onClick={handleRestart} className="btn flex-1"><RefreshCw className="h-5 w-5" /> Recommencer</button>
            <Link href={`/lessons/${lessonId}`} className="btn btn-ink flex-1">Retour à la leçon</Link>
          </GameEnd>
        </div>
      </div>
    );
  }

  // ─── Jeu ─────────────────────────────────────────────────────────────────────
  const q = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;

  function choiceClass(choice: string): string {
    if (!isAnswered) return 'choice';
    if (choice === q.correctAnswer) return 'choice choice-correct';
    if (choice === selectedAnswer) return 'choice choice-wrong';
    return 'choice choice-dim';
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-7">
        <GameHeader
          backHref="/jeux/vitesse"
          backLabel="Retour"
          title="Vitesse"
          right={<span className="flex items-center gap-1"><Timer className="h-5 w-5" /> {formatTime(total.ms)}</span>}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-bold">
            <span>Question {currentIndex + 1} / {questions.length}</span>
            <span className="flex items-center gap-3">
              <span className="sticker bg-sun"><Zap className="h-3.5 w-3.5" /> {(question.ms / 1000).toFixed(1)} s</span>
              <span className="font-display text-xl font-extrabold">{score} pts</span>
            </span>
          </div>
          <GameProgress value={((currentIndex + 1) / questions.length) * 100} color="bg-tomato" />
        </div>

        <div className="video-frame mx-auto w-full max-w-sm">
          <SignMedia sign={q.sign} />
        </div>

        <p className="text-center font-display text-2xl font-extrabold">Quel est ce signe ?</p>

        <div className="grid grid-cols-2 gap-4">
          {q.choices.map((choice) => (
            <button key={choice} onClick={() => handleSelect(choice)} disabled={isAnswered} className={choiceClass(choice)}>
              {choice}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className={`panel flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between ${selectedAnswer === q.correctAnswer ? 'bg-mint' : 'bg-tomato'}`}>
            <p className="font-display text-xl font-extrabold">
              {selectedAnswer === q.correctAnswer ? 'Bonne réponse !' : `La bonne réponse était : ${q.correctAnswer}`}
            </p>
            <button onClick={handleNext} className="btn btn-ink">
              {currentIndex + 1 === questions.length ? 'Voir les résultats' : 'Suivante'} <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GameEnd, GameHeader, GameProgress } from '@/components/brand/Game';
import { Loader } from '@/components/brand/Loader';
import { SignMedia } from '@/components/signs/SignMedia';
import { RefreshCw, Check, X, ArrowRight } from 'lucide-react';
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

  if (isLoading) return <Loader label="Prépare-toi..." />;

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
      <div className="px-6 py-14">
        <div className="mx-auto max-w-xl">
          <GameEnd
            title={feedback}
            color="bg-tomato"
            subtitle={<span className="font-display text-7xl font-extrabold">{score}<span className="text-4xl text-ink/50">/{questions.length}</span></span>}
            xp={xpEarned}
            extra={
              <>
                <span className="sticker bg-white text-sm">{percent}% de bonnes réponses</span>
                {completion?.isFirstCompletion && <span className="sticker bg-mint">Première complétion : XP enregistrés !</span>}
                <div className="panel w-full max-w-sm p-4 text-left">
                  <Leaderboard game="inverse" lessonId={lessonId} unit="%" />
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
  const isAnswered = selectedId !== null;

  function imageClass(signId: string): string {
    const base = 'relative aspect-square overflow-hidden border-[3px] border-ink bg-white transition-[transform,box-shadow] duration-100';
    if (!isAnswered) return `${base} shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg cursor-pointer`;
    if (signId === q.correctId) return `${base} shadow-hard outline outline-[6px] outline-mint`;
    if (signId === selectedId) return `${base} shadow-hard outline outline-[6px] outline-tomato`;
    return `${base} opacity-40`;
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-7">
        <GameHeader backHref="/jeux/inverse" backLabel="Retour" title="Mode inversé" right={<span>{currentIndex + 1}/{questions.length}</span>} />
        <GameProgress value={((currentIndex + 1) / questions.length) * 100} color="bg-tomato" />

        <div className="flex flex-col items-center gap-3">
          <p className="font-bold">Quel signe correspond au mot :</p>
          <p className="tile -rotate-2 bg-sun px-5 py-2 text-5xl capitalize">{q.targetSign.word}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {q.choices.map((sign) => (
            <button key={sign.id} onClick={() => handleSelect(sign.id)} className={imageClass(sign.id)} disabled={isAnswered}>
              <SignMedia sign={sign} />
              {isAnswered && (
                <span className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 border-t-[3px] border-ink px-2 py-1 font-bold ${
                  sign.id === q.correctId ? 'bg-mint' : sign.id === selectedId ? 'bg-tomato' : 'bg-white'
                }`}>
                  {sign.id === q.correctId ? <Check className="h-4 w-4 shrink-0" strokeWidth={3} /> : sign.id === selectedId ? <X className="h-4 w-4 shrink-0" strokeWidth={3} /> : null}
                  <span className="truncate">{sign.word}</span>
                </span>
              )}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className={`panel flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between ${selectedId === q.correctId ? 'bg-mint' : 'bg-tomato'}`}>
            <p className="font-display text-xl font-extrabold">
              {selectedId === q.correctId ? 'Bonne réponse !' : `La bonne réponse était : ${q.targetSign.word}`}
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

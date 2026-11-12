'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GameEnd, GameHeader, GameProgress } from '@/components/brand/Game';
import { Loader } from '@/components/brand/Loader';
import { SignMedia } from '@/components/signs/SignMedia';
import { RefreshCw, Check, X, AlertCircle, ArrowRight } from 'lucide-react';
import { lessonsApi } from '@/lib/api/lessons';
import { revisionApi } from '@/lib/api/revision';
import type { RevisionSign } from '@/lib/types';
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

  if (isLoading) return <Loader label="Recherche de tes erreurs..." />;

  if (!lesson) return null;

  // ─── Pas encore de données d'erreurs ──────────────────────────────────────────
  if (hasNoData) {
    return (
      <div className="px-6 py-14">
        <div className="mx-auto max-w-xl">
          <GameEnd
            icon={AlertCircle}
            color="bg-mint"
            title="Pas encore d'erreurs !"
            subtitle="Joue d'abord d'autres modes sur cette leçon. La révision affichera les signes sur lesquels tu t'es trompé."
          >
            <Link href="/jeux/revision" className="btn btn-ink flex-1">Changer de leçon</Link>
          </GameEnd>
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
      <div className="px-6 py-14">
        <div className="mx-auto max-w-xl">
          <GameEnd
            title={feedback}
            color="bg-mint"
            subtitle={<span className="font-display text-7xl font-extrabold">{score}<span className="text-4xl text-ink/50">/{questions.length}</span></span>}
            xp={score * XP_PER_CORRECT}
            extra={<span className="sticker bg-white text-sm">{percent}% de bonnes réponses</span>}
          >
            <button onClick={handleRestart} className="btn flex-1"><RefreshCw className="h-5 w-5" /> Recommencer</button>
            <Link href="/jeux/revision" className="btn btn-ink flex-1">Changer de leçon</Link>
          </GameEnd>
        </div>
      </div>
    );
  }

  // ─── Jeu ──────────────────────────────────────────────────────────────────────
  const q = questions[currentIndex];
  const isAnswered = selectedId !== null;

  function choiceClass(id: string): string {
    const base = 'choice w-full justify-start text-left';
    if (!isAnswered) return base;
    if (id === q.correctId) return `${base} choice-correct`;
    if (id === selectedId) return `${base} choice-wrong`;
    return `${base} choice-dim`;
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <GameHeader backHref="/jeux/revision" backLabel="Retour" title="Révision" color="bg-mint" right={<span>{currentIndex + 1}/{questions.length}</span>} />

        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-bold">
            <span className="truncate">{lesson.title}</span>
            <span className="sticker shrink-0 bg-tomato">
              {q.target.wrongCount} erreur{q.target.wrongCount > 1 ? 's' : ''} passée{q.target.wrongCount > 1 ? 's' : ''}
            </span>
          </div>
          <GameProgress value={((currentIndex + 1) / questions.length) * 100} color="bg-mint" />
        </div>

        <div key={q.target.id} className="video-frame mx-auto aspect-square w-full max-w-72">
          <SignMedia sign={q.target as any} />
        </div>

        <div className="flex flex-col gap-3">
          {q.choices.map((sign) => (
            <button key={sign.id} onClick={() => handleSelect(sign.id)} className={choiceClass(sign.id)} disabled={isAnswered}>
              {sign.word}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className={`panel flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between ${selectedId === q.correctId ? 'bg-mint' : 'bg-tomato'}`}>
            <p className="flex items-center gap-2 font-display text-xl font-extrabold">
              {selectedId === q.correctId ? <Check className="h-6 w-6" strokeWidth={3} /> : <X className="h-6 w-6" strokeWidth={3} />}
              {selectedId === q.correctId ? 'Bonne réponse !' : `C'était : ${q.target.word}`}
            </p>
            <button onClick={handleNext} className="btn btn-ink">
              {currentIndex + 1 === questions.length ? 'Voir les résultats' : 'Signe suivant'} <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

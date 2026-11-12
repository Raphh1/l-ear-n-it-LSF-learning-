'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Hand } from 'lucide-react';
import { BackLink } from '@/components/brand/BackLink';
import { Loader } from '@/components/brand/Loader';
import { lessonsApi } from '@/lib/api/lessons';
import { progressApi, type CompleteLessonResponse } from '@/lib/api/progress';
import { scoresApi } from '@/lib/api/scores';
import { revisionApi } from '@/lib/api/revision';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import { QuizResult } from '@/components/quiz/QuizResult';
import type { LessonDetail, SignInLesson } from '@/lib/types';

interface QuizQuestionData {
  sign: SignInLesson;
  choices: string[];
  correctAnswer: string;
}

function generateQuestions(signs: SignInLesson[]): QuizQuestionData[] {
  const shuffled = [...signs].sort(() => Math.random() - 0.5);
  return shuffled.map((sign) => {
    const wrongChoices = signs
      .filter((s) => s.id !== sign.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((s) => s.word);

    const choices = [...wrongChoices, sign.word].sort(() => Math.random() - 0.5);

    return { sign, choices, correctAnswer: sign.word };
  });
}

type Phase = 'playing' | 'result';

export default function QuizPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [completion, setCompletion] = useState<CompleteLessonResponse | null>(null);
  const attemptsRef = useRef<{ signId: string; isCorrect: boolean }[]>([]);

  useEffect(() => {
    lessonsApi.getById(lessonId)
      .then((data) => {
        setLesson(data);
        setQuestions(generateQuestions(data.signs));
      })
      .catch(() => router.push('/modules'))
      .finally(() => setIsLoading(false));
  }, [lessonId, router]);

  function handleAnswer(isCorrect: boolean) {
    if (isCorrect) setScore((s) => s + 1);
    attemptsRef.current.push({ signId: questions[currentIndex].sign.id, isCorrect });
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      const finalScore = score;
      const pct = Math.round((finalScore / questions.length) * 100);
      progressApi.completeLesson(lessonId, finalScore, questions.length)
        .then(setCompletion)
        .catch(() => {});
      scoresApi.submit('quiz', lessonId, pct).catch(() => {});
      revisionApi.submitAttempts(attemptsRef.current).catch(() => {});
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  const handleRestart = useCallback(() => {
    if (!lesson) return;
    setQuestions(generateQuestions(lesson.signs));
    setCurrentIndex(0);
    setScore(0);
    setPhase('playing');
    attemptsRef.current = [];
  }, [lesson]);

  if (isLoading) {
    return <Loader label="Préparation du quiz..." />;
  }

  if (!lesson) return null;

  if (lesson.signs.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24">
        <p className="font-display text-2xl font-extrabold">Pas assez de signes pour lancer un quiz.</p>
        <Link href={`/lessons/${lessonId}`} className="btn btn-ink">Retour à la leçon</Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-12">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <BackLink href={`/lessons/${lessonId}`}>Retour à la leçon</BackLink>
          <div className="flex items-center gap-3">
            <span className="sticker -rotate-2 bg-tomato">Quiz</span>
            <h1 className="text-3xl font-extrabold leading-tight">{lesson.title}</h1>
          </div>
        </div>

        {/* Conseil pratique */}
        <div className="panel-flat flex items-start gap-3 bg-sun px-4 py-3">
          <Hand className="mt-0.5 h-6 w-6 shrink-0" strokeWidth={2.5} />
          <p className="leading-relaxed">
            <strong>Conseil :</strong> reproduis les signes avec tes mains pendant que tu joues. C&apos;est le meilleur moyen de les mémoriser.
          </p>
        </div>

        {/* Contenu */}
        {phase === 'playing' ? (
          <QuizQuestion
            key={currentIndex}
            question={questions[currentIndex]}
            questionIndex={currentIndex}
            total={questions.length}
            isLast={currentIndex + 1 === questions.length}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        ) : (
          <QuizResult
            score={score}
            total={questions.length}
            xpReward={lesson.xpReward}
            lessonId={lessonId}
            completion={completion}
            onRestart={handleRestart}
          />
        )}

      </div>
    </div>
  );
}

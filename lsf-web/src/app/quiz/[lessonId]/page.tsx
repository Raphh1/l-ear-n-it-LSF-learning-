'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Info } from 'lucide-react';
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
    return (
      <div className="min-h-screen bg-[#0a0a1a] px-6 py-16 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lesson) return null;

  if (lesson.signs.length < 2) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] px-6 py-16 flex flex-col items-center justify-center gap-4">
        <p className="text-white/50 text-sm">Pas assez de signes pour lancer un quiz.</p>
        <Link href={`/lessons/${lessonId}`} className="text-violet-400 text-sm hover:text-violet-300 transition-colors">
          Retour à la leçon
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      {/* Blobs de fond */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative max-w-xl mx-auto flex flex-col gap-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-1"
        >
          <Link
            href={`/lessons/${lessonId}`}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour à la leçon
          </Link>
          <h1 className="text-2xl font-bold text-white mt-3">{lesson.title}</h1>
          <p className="text-white/30 text-sm">Quiz</p>
        </motion.div>

        {/* Conseil pratique */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-start gap-3 px-4 py-3 rounded-xl border border-violet-500/20 bg-violet-500/10"
        >
          <Info className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
          <p className="text-violet-300/80 text-sm leading-relaxed">
            <span className="font-semibold text-violet-300">Conseil :</span> n&apos;oubliez pas de pratiquer les mouvements en même temps que vous suivez les cours et le dictionnaire — reproduire les signes à la main est essentiel pour les mémoriser.
          </p>
        </motion.div>

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

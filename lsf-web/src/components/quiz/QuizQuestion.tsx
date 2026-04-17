'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { SignInLesson } from '@/lib/types';

interface QuizQuestionData {
  sign: SignInLesson;
  choices: string[];
  correctAnswer: string;
}

interface Props {
  question: QuizQuestionData;
  questionIndex: number;
  total: number;
  isLast: boolean;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export function QuizQuestion({ question, questionIndex, total, isLast, onAnswer, onNext }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const isAnswered = selectedAnswer !== null;

  function handleSelect(choice: string) {
    if (isAnswered) return;
    setSelectedAnswer(choice);
    onAnswer(choice === question.correctAnswer);
  }

  function getChoiceStyle(choice: string): string {
    const base = 'flex items-center justify-center px-4 py-4 rounded-2xl border text-sm font-medium transition-all duration-200 text-center';
    if (!isAnswered) {
      return `${base} bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 cursor-pointer`;
    }
    if (choice === question.correctAnswer) {
      return `${base} bg-emerald-500/15 border-emerald-500/40 text-emerald-300 cursor-default`;
    }
    if (choice === selectedAnswer) {
      return `${base} bg-rose-500/15 border-rose-500/40 text-rose-300 cursor-default`;
    }
    return `${base} bg-white/5 border-white/5 text-white/20 cursor-default`;
  }

  const { sign } = question;

  return (
    <motion.div
      key={questionIndex}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-8"
    >
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-white/30">
          <span>Question {questionIndex + 1} / {total}</span>
          <span>{Math.round(((questionIndex) / total) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
            initial={{ width: `${(questionIndex / total) * 100}%` }}
            animate={{ width: `${((questionIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Media */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden max-w-sm mx-auto w-full">
        {sign.videoUrl ? (
          <video
            key={sign.id}
            src={sign.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full"
          />
        ) : sign.gifUrl ? (
          <div className="relative aspect-square">
            <Image src={sign.gifUrl} alt="signe" fill className="object-contain" unoptimized />
          </div>
        ) : sign.thumbnailUrl ? (
          <div className="relative aspect-square bg-white overflow-hidden">
            <Image src={sign.thumbnailUrl} alt="signe" fill className="object-contain p-2" />
            {/* Cache la lettre en bas de l'image */}
            <div className="absolute bottom-0 left-0 right-0 h-[34.5%] bg-white" />
          </div>
        ) : (
          <div className="aspect-square flex items-center justify-center">
            <span className="text-7xl text-white/10">🤟</span>
          </div>
        )}
      </div>

      {/* Question */}
      <p className="text-center text-white/50 text-sm">Quel est ce signe ?</p>

      {/* Choix */}
      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => handleSelect(choice)}
            className={getChoiceStyle(choice)}
          >
            {isAnswered && choice === question.correctAnswer && (
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-400" />
            )}
            {isAnswered && choice === selectedAnswer && choice !== question.correctAnswer && (
              <XCircle className="w-4 h-4 mr-2 shrink-0 text-rose-400" />
            )}
            {choice}
          </button>
        ))}
      </div>

      {/* Feedback + bouton suivant */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-4"
        >
          <p className={`text-sm font-medium ${selectedAnswer === question.correctAnswer ? 'text-emerald-400' : 'text-rose-400'}`}>
            {selectedAnswer === question.correctAnswer
              ? 'Bonne réponse !'
              : `La bonne réponse était : ${question.correctAnswer}`}
          </p>
          <button
            onClick={onNext}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
          >
            {isLast ? 'Voir les résultats' : 'Question suivante'}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

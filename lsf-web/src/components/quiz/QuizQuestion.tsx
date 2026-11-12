'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, X, Hand, ArrowRight } from 'lucide-react';
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
  const isCorrect = selectedAnswer === question.correctAnswer;

  function handleSelect(choice: string) {
    if (isAnswered) return;
    setSelectedAnswer(choice);
    onAnswer(choice === question.correctAnswer);
  }

  function choiceClass(choice: string): string {
    if (!isAnswered) return 'choice';
    if (choice === question.correctAnswer) return 'choice choice-correct';
    if (choice === selectedAnswer) return 'choice choice-wrong';
    return 'choice choice-dim';
  }

  const { sign } = question;

  return (
    <div key={questionIndex} className="flex flex-col gap-8">
      {/* Progression */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between font-bold">
          <span>Question {questionIndex + 1} / {total}</span>
          <span>{Math.round((questionIndex / total) * 100)}%</span>
        </div>
        <div className="bar h-5"><span className="bg-sun" style={{ width: `${((questionIndex + 1) / total) * 100}%` }} /></div>
      </div>

      {/* Média */}
      <div className="video-frame mx-auto w-full max-w-sm">
        {sign.videoUrl ? (
          <video key={sign.id} src={sign.videoUrl} autoPlay loop muted playsInline className="w-full bg-white" />
        ) : sign.gifUrl ? (
          <div className="relative aspect-square">
            <Image src={sign.gifUrl} alt="signe" fill className="object-contain" unoptimized />
          </div>
        ) : sign.thumbnailUrl ? (
          <div className="relative aspect-square overflow-hidden bg-white">
            <Image src={sign.thumbnailUrl} alt="signe" fill className="object-contain p-2" />
            {/* Cache la lettre en bas de l'image */}
            <div className="absolute bottom-0 left-0 right-0 h-[34.5%] bg-white" />
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center bg-paper">
            <Hand className="h-20 w-20 text-ink/25" />
          </div>
        )}
      </div>

      <p className="text-center font-display text-2xl font-extrabold">Quel est ce signe ?</p>

      {/* Choix */}
      <div className="grid grid-cols-2 gap-4">
        {question.choices.map((choice) => (
          <button key={choice} onClick={() => handleSelect(choice)} disabled={isAnswered} className={choiceClass(choice)}>
            {isAnswered && choice === question.correctAnswer && <Check className="h-5 w-5 shrink-0" strokeWidth={3} />}
            {isAnswered && choice === selectedAnswer && !isCorrect && <X className="h-5 w-5 shrink-0" strokeWidth={3} />}
            {choice}
          </button>
        ))}
      </div>

      {/* Retour + suivant */}
      {isAnswered && (
        <div className={`panel flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between ${isCorrect ? 'bg-mint' : 'bg-tomato'}`}>
          <p className="font-display text-xl font-extrabold">
            {isCorrect ? 'Bonne réponse !' : `La bonne réponse était : ${question.correctAnswer}`}
          </p>
          <button onClick={onNext} className="btn btn-ink">
            {isLast ? 'Voir les résultats' : 'Question suivante'} <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

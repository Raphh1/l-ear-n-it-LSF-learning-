'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Brain, Check, X, RefreshCw, Eye } from 'lucide-react';
import { SignMedia } from '@/components/signs/SignMedia';
import { revisionApi, type SignAttempt } from '@/lib/api/revision';
import { progressApi } from '@/lib/api/progress';
import { GameEnd, GameHeader, GameProgress } from '@/components/brand/Game';
import { Loader } from '@/components/brand/Loader';
import type { RevisionSign } from '@/lib/types';

type Phase = 'loading' | 'empty' | 'question' | 'reveal' | 'result';

export default function SrsPage() {
  const [signs, setSigns] = useState<RevisionSign[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState<SignAttempt[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');

  useEffect(() => {
    revisionApi.getDueSigns().then((data) => {
      if (data.length === 0) {
        setPhase('empty');
      } else {
        setSigns(data);
        setPhase('question');
      }
    });
  }, []);

  const current = signs[index];

  const answer = useCallback(async (isCorrect: boolean) => {
    if (!current) return;
    const newAttempts = [...attempts, { signId: current.id, isCorrect }];
    if (isCorrect) setCorrectCount((c) => c + 1);
    setAttempts(newAttempts);

    if (index + 1 >= signs.length) {
      await revisionApi.submitAttempts(newAttempts);
      await progressApi.awardXp(correctCount + (isCorrect ? 1 : 0));
      setPhase('result');
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
      setPhase('question');
    }
  }, [current, attempts, index, signs.length, correctCount]);

  if (phase === 'loading') return <Loader label="Préparation de la révision..." />;

  if (phase === 'empty') {
    return (
      <div className="px-6 py-14">
        <div className="mx-auto max-w-xl">
          <GameEnd
            icon={Brain}
            color="bg-mint"
            title="Rien à réviser aujourd'hui"
            subtitle="Tous tes signes sont à jour. Reviens demain ou joue pour en apprendre de nouveaux !"
          >
            <Link href="/jeux" className="btn btn-ink flex-1">Retour aux jeux</Link>
          </GameEnd>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const total = signs.length;
    const pct = Math.round((correctCount / total) * 100);
    return (
      <div className="px-6 py-14">
        <div className="mx-auto max-w-xl">
          <GameEnd
            color="bg-mint"
            title="Révision terminée !"
            subtitle={`${correctCount}/${total} signes maîtrisés (${pct}%)`}
            xp={correctCount}
          >
            <Link href="/jeux" className="btn flex-1">Retour aux jeux</Link>
            <button
              onClick={() => {
                setIndex(0); setCorrectCount(0); setAttempts([]); setRevealed(false); setPhase('question');
              }}
              className="btn btn-ink flex-1"
            >
              <RefreshCw className="h-5 w-5" /> Rejouer
            </button>
          </GameEnd>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <GameHeader title="Révision SRS" color="bg-mint" right={<span>{index + 1}/{signs.length}</span>} />
        <GameProgress value={(index / signs.length) * 100} color="bg-mint" />

        <div key={current?.id} className="panel overflow-hidden shadow-hard-lg">
          <div className="aspect-square border-b-[3px] border-ink">
            <SignMedia sign={current} />
          </div>

          <div className="p-5 text-center">
            {revealed ? (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="font-display text-4xl font-extrabold capitalize">{current?.word}</p>
                  {current?.nextReviewAt && (
                    <p className="mt-1 text-sm font-bold">Intervalle actuel : {current.srsInterval} j</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => answer(false)} className="btn btn-tomato flex-1">
                    <X className="h-5 w-5" strokeWidth={3} /> À revoir
                  </button>
                  <button onClick={() => answer(true)} className="btn btn-mint flex-1">
                    <Check className="h-5 w-5" strokeWidth={3} /> Je savais
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setRevealed(true)} className="btn btn-ink btn-lg w-full">
                <Eye className="h-5 w-5" /> Révéler
              </button>
            )}
          </div>
        </div>

        {!revealed && (
          <p className="text-center font-bold">
            Observe le signe, puis révèle le mot et évalue-toi honnêtement.
          </p>
        )}
      </div>
    </div>
  );
}

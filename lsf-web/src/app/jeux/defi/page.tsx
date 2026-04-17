'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SignMedia } from '@/components/signs/SignMedia';
import { ChevronLeft, Star, CheckCircle2, XCircle, Share2, Lock } from 'lucide-react';
import { dailyApi, type DailyChallenge, type SubmitDailyResponse } from '@/lib/api/daily';
import { useProgressStore } from '@/store/progressStore';
import { useAuthStore } from '@/store/authStore';

type Phase = 'playing' | 'result';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function buildShareText(isCorrect: boolean, date: string) {
  const emoji = isCorrect ? '✅' : '❌';
  const dateLabel = new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return `Défi LSF du ${dateLabel} : ${emoji}\nJoue sur L'ear'n it !`;
}

export default function DefiPage() {
  const { user } = useAuthStore();
  const addXp = useProgressStore((s) => s.addXp);

  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('playing');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitDailyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dailyApi.getToday()
      .then((data) => {
        setChallenge(data);
        if (data.alreadyPlayed) {
          setPhase('result');
          // Reconstruit le résultat depuis les données du challenge
          setResult({
            isCorrect: data.wasCorrect ?? false,
            correctWord: data.sign.word,
            xpEarned: 0,
            newXpTotal: 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSelect(choice: string) {
    if (selectedChoice !== null || !challenge || phase === 'result') return;
    setSelectedChoice(choice);

    if (!user) {
      // Visiteur non connecté — affiche juste le résultat local sans soumettre
      const isCorrect = choice === challenge.sign.word;
      setResult({ isCorrect, correctWord: challenge.sign.word, xpEarned: 0, newXpTotal: 0 });
      setTimeout(() => setPhase('result'), 600);
      return;
    }

    try {
      const res = await dailyApi.submit(choice);
      setResult(res);
      if (res.xpEarned > 0) addXp(res.xpEarned);
    } catch {
      // Déjà joué (conflict 409) ou erreur réseau
      const isCorrect = choice === challenge.sign.word;
      setResult({ isCorrect, correctWord: challenge.sign.word, xpEarned: 0, newXpTotal: 0 });
    }

    setTimeout(() => setPhase('result'), 600);
  }

  async function handleShare() {
    if (!challenge || !result) return;
    const text = buildShareText(result.isCorrect, challenge.date);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencieux
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <p className="text-white/40">Aucun défi disponible pour le moment.</p>
      </div>
    );
  }

  const isAnswered = selectedChoice !== null || phase === 'result';
  const wasCorrect = result?.isCorrect ?? false;

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-10 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-yellow-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-amber-600/15 blur-[120px]" />

      <div className="relative max-w-xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/jeux"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Jeux
          </Link>
          <div className="flex flex-col items-end">
            <span className="text-white/80 text-sm font-semibold">Défi du jour</span>
            <span className="text-white/30 text-xs">{formatDate(challenge.date)}</span>
          </div>
        </div>

        {/* Bandeau "déjà joué" */}
        {challenge.alreadyPlayed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/40 text-sm"
          >
            <Lock className="w-4 h-4 shrink-0" />
            Tu as déjà joué aujourd&apos;hui. Reviens demain !
          </motion.div>
        )}

        {/* Image du signe */}
        <div className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <SignMedia sign={challenge.sign as any} />
        </div>

        {/* Choix */}
        <div className="flex flex-col gap-2">
          {challenge.choices.map((choice) => {
            let style = 'w-full px-4 py-4 rounded-2xl border text-sm font-semibold text-left transition-all duration-200';
            if (!isAnswered) {
              style += ' bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/25 cursor-pointer';
            } else if (choice === challenge.sign.word) {
              style += ' bg-emerald-500/15 border-emerald-500/40 text-emerald-300 cursor-default';
            } else if (choice === selectedChoice) {
              style += ' bg-rose-500/15 border-rose-500/40 text-rose-300 cursor-default';
            } else {
              style += ' bg-white/3 border-white/5 text-white/25 cursor-default';
            }

            return (
              <button
                key={choice}
                onClick={() => handleSelect(choice)}
                className={style}
                disabled={isAnswered}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {/* Résultat */}
        <AnimatePresence>
          {phase === 'result' && result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-5 py-2"
            >
              {/* Feedback correct/incorrect */}
              <div className={`flex items-center gap-2 text-base font-bold ${wasCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                {wasCorrect
                  ? <CheckCircle2 className="w-5 h-5" />
                  : <XCircle className="w-5 h-5" />
                }
                {wasCorrect
                  ? 'Bonne réponse !'
                  : `C'était : ${result.correctWord}`
                }
              </div>

              {/* XP (seulement si connecté et XP > 0) */}
              {result.xpEarned > 0 && (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-semibold text-sm">+{result.xpEarned} XP gagnés</span>
                </div>
              )}

              {!user && (
                <p className="text-white/30 text-xs text-center">
                  <Link href="/login" className="text-yellow-400 hover:underline">Connecte-toi</Link> pour sauvegarder tes XP.
                </p>
              )}

              {/* Bouton partage */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Copié !' : 'Partager mon score'}
              </button>

              <p className="text-white/25 text-xs">Prochain défi demain à minuit.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

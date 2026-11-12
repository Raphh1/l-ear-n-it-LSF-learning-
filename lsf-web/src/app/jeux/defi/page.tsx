'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SignMedia } from '@/components/signs/SignMedia';
import { Star, Check, X, Share2, Lock } from 'lucide-react';
import { dailyApi, type DailyChallenge, type SubmitDailyResponse } from '@/lib/api/daily';
import { useProgressStore } from '@/store/progressStore';
import { useAuthStore } from '@/store/authStore';
import { BackLink } from '@/components/brand/BackLink';
import { Loader } from '@/components/brand/Loader';

type Phase = 'playing' | 'result';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function buildShareText(isCorrect: boolean, date: string) {
  const result = isCorrect ? 'réussi' : 'raté';
  const dateLabel = new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return `Défi LSF du ${dateLabel} : ${result}\nJoue sur L'ear'n it !`;
}

export default function DefiPage() {
  const { user } = useAuthStore();
  const addXp = useProgressStore((s) => s.addXp);

  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
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
      .catch(() => setLoadError(true))
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

  if (isLoading) return <Loader label="Chargement du défi..." />;

  if (loadError || !challenge) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24">
        <p className="font-display text-2xl font-extrabold">
          {loadError ? 'Impossible de charger le défi. Vérifie ta connexion.' : 'Aucun défi disponible pour le moment.'}
        </p>
        {loadError && <button onClick={() => window.location.reload()} className="btn btn-ink">Réessayer</button>}
      </div>
    );
  }

  const isAnswered = selectedChoice !== null || phase === 'result';
  const wasCorrect = result?.isCorrect ?? false;

  function choiceClass(choice: string) {
    if (!isAnswered) return 'choice justify-start text-left';
    if (choice === challenge!.sign.word) return 'choice choice-correct justify-start text-left';
    if (choice === selectedChoice) return 'choice choice-wrong justify-start text-left';
    return 'choice choice-dim justify-start text-left';
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-sun px-6 py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <BackLink href="/jeux">Jeux</BackLink>
          <div className="flex flex-col items-end">
            <span className="font-display text-xl font-extrabold">Défi du jour</span>
            <span className="text-sm font-bold capitalize">{formatDate(challenge.date)}</span>
          </div>
        </div>

        {challenge.alreadyPlayed && (
          <div className="notice flex items-center gap-2">
            <Lock className="h-5 w-5 shrink-0" /> Tu as déjà joué aujourd&apos;hui. Reviens demain !
          </div>
        )}

        <div className="video-frame mx-auto w-full max-w-xs -rotate-1">
          <SignMedia sign={challenge.sign as any} />
        </div>

        <p className="text-center font-display text-3xl font-extrabold">Quel est ce signe ?</p>

        <div className="flex flex-col gap-3">
          {challenge.choices.map((choice) => (
            <button key={choice} onClick={() => handleSelect(choice)} className={choiceClass(choice)} disabled={isAnswered}>
              {isAnswered && choice === challenge.sign.word && <Check className="h-5 w-5 shrink-0" strokeWidth={3} />}
              {isAnswered && choice === selectedChoice && choice !== challenge.sign.word && <X className="h-5 w-5 shrink-0" strokeWidth={3} />}
              {choice}
            </button>
          ))}
        </div>

        {phase === 'result' && result && (
          <div className={`panel flex flex-col items-center gap-5 p-6 shadow-hard-lg ${wasCorrect ? 'bg-mint' : 'bg-tomato'}`}>
            <p className="flex items-center gap-2 font-display text-2xl font-extrabold">
              {wasCorrect ? <Check className="h-7 w-7" strokeWidth={3} /> : <X className="h-7 w-7" strokeWidth={3} />}
              {wasCorrect ? 'Bonne réponse !' : `C'était : ${result.correctWord}`}
            </p>

            {result.xpEarned > 0 && (
              <span className="tile rotate-2 bg-sun text-lg">
                <Star className="mr-2 h-5 w-5 fill-ink" /> +{result.xpEarned} XP
              </span>
            )}

            {!user && (
              <p className="text-center font-bold">
                <Link href="/login" className="link">Connecte-toi</Link> pour sauvegarder tes XP.
              </p>
            )}

            <button onClick={handleShare} className="btn">
              <Share2 className="h-5 w-5" /> {copied ? 'Copié !' : 'Partager mon score'}
            </button>

            <p className="text-sm font-bold">Prochain défi demain à minuit.</p>
          </div>
        )}
      </div>
    </div>
  );
}

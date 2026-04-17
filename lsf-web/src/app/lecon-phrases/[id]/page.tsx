'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, MessageSquareText, Layers } from 'lucide-react';
import { phrasesApi } from '@/lib/api/phrases';
import { SignMedia } from '@/components/signs/SignMedia';
import type { PhraseLesson, Phrase } from '@/lib/types';

function PhraseCard({ phrase, index, total }: { phrase: Phrase; index: number; total: number }) {
  const [activeSignIndex, setActiveSignIndex] = useState(0);

  // Auto-play un par un (1000ms delay après un signe si non-vidéo ou timeout)
  useEffect(() => {
    setActiveSignIndex(0);
  }, [phrase.id]);

  const handleSignEnded = () => {
    setTimeout(() => {
      setActiveSignIndex((prev) => (prev + 1) % phrase.signs.length);
    }, 400); // Petite pause entre les signes
  };

  // Helper timer if a sign has no video and doesn't trigger onEnded
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentSign = phrase.signs[activeSignIndex];
    if (currentSign && !currentSign.videoUrl) {
      // Pour les signes sans URL vidéo en dur qui pourraient bloquer, setup un timeout de secours
      timer = setTimeout(() => {
        handleSignEnded();
      }, 2500); // Durée par défaut de 2.5s
    }
    return () => clearTimeout(timer);
  }, [activeSignIndex, phrase]);

  return (
    <motion.div
      key={phrase.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Compteur */}
      <div className="flex items-center justify-between text-xs text-white/30">
        <span>Phrase {index + 1} / {total}</span>
        <div className="h-1 flex-1 mx-4 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-400"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Texte français */}
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-2">En français</p>
        <p className="text-white text-2xl font-semibold">{phrase.textFr}</p>
      </div>

      {/* Gloss LSF */}
      <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 px-6 py-4">
        <p className="text-teal-400/60 text-xs uppercase tracking-widest font-semibold mb-2">Ordre en LSF (gloss)</p>
        <p className="text-teal-300 text-lg font-mono font-bold tracking-wide">{phrase.textLsf}</p>
        <p className="text-white/25 text-xs mt-1">
          L&apos;ordre des signes est différent du français — c&apos;est la grammaire de la LSF.
        </p>
      </div>

      {/* Vidéo de la phrase entière */}
      {phrase.videoUrl && (
        <div className="flex flex-col gap-2">
          <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Phrase complète</p>
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden max-w-sm mx-auto w-full">
            <SignMedia sign={{ videoUrl: phrase.videoUrl, gifUrl: null, thumbnailUrl: null } as never} />
          </div>
        </div>
      )}

      {/* Signes constitutifs dans l'ordre LSF */}
      <div className="flex flex-col gap-3">
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          Signes dans l&apos;ordre LSF
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {phrase.signs.map((sign, i) => {
            const isActive = i === activeSignIndex;
            return (
              <div key={sign.id} className="flex flex-col gap-2">
                <div
                  className={`relative rounded-xl overflow-hidden border transition-all duration-300 ${
                    isActive ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.3)] scale-105 z-10' : 'border-white/10 bg-white/5 opacity-60'
                  }`}
                >
                  <SignMedia
                    sign={sign as never}
                    isPlaying={isActive}
                    loop={false}
                    onEnded={isActive ? handleSignEnded : undefined}
                  />
                  <span className={`absolute top-2 left-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow transition-colors ${isActive ? 'bg-teal-500 text-white' : 'bg-white/20 text-white/50'}`}>
                    {i + 1}
                  </span>
                </div>
                <span className={`text-sm font-semibold text-center capitalize transition-colors ${isActive ? 'text-teal-400' : 'text-white/40'}`}>
                  {sign.word}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default function LeconPhrasesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<PhraseLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    phrasesApi.getByLesson(id)
      .then(setLesson)
      .catch(() => router.push('/modules'))
      .finally(() => setIsLoading(false));
  }, [id, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!lesson) return;
      if (e.key === 'ArrowRight') setCurrentIndex((i) => Math.min(i + 1, lesson.phrases.length - 1));
      if (e.key === 'ArrowLeft')  setCurrentIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lesson]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] px-6 py-16">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <div className="h-5 w-36 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-10 w-72 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-24 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === lesson.phrases.length - 1;

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-teal-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-600/15 blur-[120px]" />

      <div className="relative max-w-2xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3"
        >
          <Link
            href="/modules"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour aux modules
          </Link>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-teal-400" />
              <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/30">
              <span>{lesson.phrases.length} phrase{lesson.phrases.length > 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1 text-amber-400/70">
                <Star className="w-3.5 h-3.5" />
                {lesson.xpReward} XP
              </span>
            </div>
          </div>
        </motion.div>

        {/* Carte phrase */}
        <AnimatePresence mode="wait">
          <PhraseCard
            key={currentIndex}
            phrase={lesson.phrases[currentIndex]}
            index={currentIndex}
            total={lesson.phrases.length}
          />
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentIndex((i) => i - 1)}
            disabled={isFirst}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-sm font-medium hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédente
          </button>

          {isLast ? (
            <Link
              href={`/jeux/constructeur/${lesson.id}`}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
            >
              S&apos;entraîner →
            </Link>
          ) : (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
            >
              Suivante
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Lien direct vers le jeu */}
        {!isLast && (
          <div className="flex justify-center">
            <Link
              href={`/jeux/constructeur/${lesson.id}`}
              className="text-white/30 text-xs hover:text-white/50 transition-colors"
            >
              Passer directement à l&apos;entraînement →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

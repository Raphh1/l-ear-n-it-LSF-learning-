'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, MessageSquareText, Layers, ArrowRight } from 'lucide-react';
import { phrasesApi } from '@/lib/api/phrases';
import { SignMedia } from '@/components/signs/SignMedia';
import { BackLink } from '@/components/brand/BackLink';
import { GameProgress } from '@/components/brand/Game';
import type { PhraseLesson, Phrase } from '@/lib/types';

const GLOSS_COLORS = ['bg-sun', 'bg-white', 'bg-tomato', 'bg-mint'];
const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

function PhraseCard({ phrase, index, total }: { phrase: Phrase; index: number; total: number }) {
  const [activeSignIndex, setActiveSignIndex] = useState(0);

  // Lecture des signes un par un
  useEffect(() => {
    setActiveSignIndex(0);
  }, [phrase.id]);

  const handleSignEnded = () => {
    setTimeout(() => {
      setActiveSignIndex((prev) => (prev + 1) % phrase.signs.length);
    }, 400); // Petite pause entre les signes
  };

  // Minuteur de secours pour les signes sans vidéo (pas d'événement onEnded)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentSign = phrase.signs[activeSignIndex];
    if (currentSign && !currentSign.videoUrl) {
      timer = setTimeout(() => {
        handleSignEnded();
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [activeSignIndex, phrase]);

  return (
    <div key={phrase.id} className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <span className="font-bold">Phrase {index + 1} / {total}</span>
        <GameProgress value={((index + 1) / total) * 100} color="bg-ocean" />
      </div>

      {/* Français */}
      <div className="panel px-6 py-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest">En français</p>
        <p className="font-display text-3xl font-extrabold leading-tight">« {phrase.textFr} »</p>
      </div>

      {/* Glose LSF en tuiles */}
      <div className="panel bg-ocean px-6 py-5 text-white">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest">Ordre indicatif en LSF</p>
        <div className="flex flex-wrap gap-3">
          {phrase.textLsf.split(/\s+/).filter(Boolean).map((word, i) => (
            <span key={`${word}-${i}`} className={`tile text-xl text-ink ${GLOSS_COLORS[i % GLOSS_COLORS.length]} ${TILTS[i % TILTS.length]}`}>
              {word}
            </span>
          ))}
        </div>
        <p className="mt-4 text-white/90">
          Une proposition parmi d&apos;autres : en LSF, l&apos;ordre est souple. Le temps se place au début et la question à la fin, mais l&apos;expression du visage, l&apos;espace et la direction des signes portent aussi le sens.
        </p>
      </div>

      {/* Vidéo de la phrase entière */}
      {phrase.videoUrl && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold uppercase tracking-widest">Phrase complète</p>
          <div className="video-frame mx-auto w-full max-w-sm">
            <SignMedia sign={{ videoUrl: phrase.videoUrl, gifUrl: null, thumbnailUrl: null } as never} />
          </div>
        </div>
      )}

      {/* Signes dans l'ordre */}
      <div className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <Layers className="h-4 w-4" /> Les signes de la phrase
        </p>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {phrase.signs.map((sign, i) => {
            const isActive = i === activeSignIndex;
            return (
              <div key={sign.id} className="flex flex-col gap-2">
                <div className={`relative overflow-hidden border-[3px] border-ink transition-transform duration-200 ${
                  isActive ? '-translate-y-1 bg-sun shadow-hard-lg' : 'bg-white shadow-hard-sm'
                }`}>
                  <SignMedia
                    sign={sign as never}
                    isPlaying={isActive}
                    loop={false}
                    onEnded={isActive ? handleSignEnded : undefined}
                  />
                  <span className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center border-2 border-ink font-display text-sm font-extrabold ${isActive ? 'bg-sun' : 'bg-white'}`}>
                    {i + 1}
                  </span>
                </div>
                <span className={`text-center font-display text-lg font-extrabold uppercase ${isActive ? '' : 'text-ink/60'}`}>
                  {sign.word}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
      <div className="px-6 py-14">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-14 w-80" />
          <div className="skeleton h-32" />
          <div className="skeleton h-28" />
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === lesson.phrases.length - 1;

  return (
    <div className="px-6 py-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="flex flex-col gap-4">
          <BackLink href="/modules">Retour aux modules</BackLink>
          <div className="flex flex-col gap-3">
            <h1 className="flex items-center gap-3 text-4xl font-extrabold leading-tight">
              <MessageSquareText className="h-8 w-8 shrink-0" strokeWidth={2.5} /> {lesson.title}
            </h1>
            <div className="flex items-center gap-3">
              <span className="sticker bg-ocean text-sm text-white">{lesson.phrases.length} phrase{lesson.phrases.length > 1 ? 's' : ''}</span>
              <span className="sticker bg-sun text-sm"><Star className="h-4 w-4" /> {lesson.xpReward} XP</span>
            </div>
          </div>
        </div>

        <PhraseCard
          key={currentIndex}
          phrase={lesson.phrases[currentIndex]}
          index={currentIndex}
          total={lesson.phrases.length}
        />

        <div className="flex items-center justify-between gap-4 border-t-[3px] border-ink pt-6">
          <button onClick={() => setCurrentIndex((i) => i - 1)} disabled={isFirst} className="btn">
            <ChevronLeft className="h-5 w-5" /> Précédente
          </button>

          {isLast ? (
            <Link href={`/jeux/constructeur/${lesson.id}`} className="btn btn-ocean btn-lg">
              S&apos;entraîner <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <button onClick={() => setCurrentIndex((i) => i + 1)} className="btn btn-ink">
              Suivante <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {!isLast && (
          <div className="flex justify-center">
            <Link href={`/jeux/constructeur/${lesson.id}`} className="link">
              Passer directement à l&apos;entraînement →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

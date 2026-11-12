'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Play } from 'lucide-react';
import type { SignSummary } from '@/lib/types';
import { signsApi } from '@/lib/api/signs';
import { useFavoriteStore } from '@/store/favoriteStore';
import { useAuthStore } from '@/store/authStore';

interface CardSign {
  id: string;
  word: string;
  slug: string;
  difficulty: number;
}

// Carte commune : le mot en grand, la vidéo Elix se lance au survol
export function SignCardFrame({ sign, subtitle }: { sign: CardSign; subtitle?: string }) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const { user } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const isFav = user ? isFavorite(sign.id) : false;

  function handleMouseEnter() {
    setHovered(true);
    if (videoSrc === null) {
      const query = sign.word.length === 1 ? `lettre ${sign.word.toLowerCase()}` : sign.word;
      signsApi.getElixVideos(query)
        .then((res) => {
          if (res.videos.length > 0) setVideoSrc(res.videos[0].uri);
        })
        .catch(() => null);
    }
  }

  const showVideo = hovered && videoSrc;

  return (
    <Link
      href={`/dictionnaire/${sign.slug}`}
      className="panel press group flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden border-b-[3px] border-ink bg-paper">
        {showVideo ? (
          <video src={videoSrc} autoPlay loop muted playsInline className="absolute inset-0 h-full w-full bg-white object-contain" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <span className="break-words text-center font-display text-3xl font-extrabold capitalize leading-none">
              {sign.word}
            </span>
          </div>
        )}
        {!showVideo && (
          <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center border-2 border-ink bg-sun opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-4 w-4 fill-ink" />
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-extrabold capitalize leading-tight">{sign.word}</h3>
          {subtitle && <p className="truncate text-sm text-ink/70">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex gap-0.5" title={`Difficulté ${sign.difficulty}/3`} aria-hidden>
            {[1, 2, 3].map(n => (
              <span key={n} className={`h-2.5 w-2.5 border-2 border-ink ${n <= (sign.difficulty || 1) ? 'bg-ink' : 'bg-white'}`} />
            ))}
          </span>
          {user && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(sign.id);
              }}
              className={`border-2 border-ink p-1 ${isFav ? 'bg-tomato' : 'bg-white hover:bg-tomato'}`}
              aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart className={`h-4 w-4 ${isFav ? 'fill-ink' : ''}`} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

export function SignCard({ sign }: { sign: SignSummary }) {
  return <SignCardFrame sign={sign} subtitle={sign.categoryName} />;
}

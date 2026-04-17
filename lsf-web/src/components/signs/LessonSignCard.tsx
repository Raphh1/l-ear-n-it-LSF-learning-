'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { SignInLesson } from '@/lib/types';
import { signsApi } from '@/lib/api/signs';
import { useFavoriteStore } from '@/store/favoriteStore';
import { useAuthStore } from '@/store/authStore';

const difficultyColor: Record<number, string> = {
  1: 'text-emerald-400',
  2: 'text-amber-400',
  3: 'text-rose-400',
};

const difficultyLabel: Record<number, string> = {
  1: '●○○',
  2: '●●○',
  3: '●●●',
};

export function LessonSignCard({ sign }: { sign: SignInLesson }) {
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

  return (
    <Link href={`/dictionnaire/${sign.slug}`}>
      <div
        className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-violet-500/40 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={`relative aspect-square overflow-hidden ${hovered && videoSrc ? 'bg-white' : ''}`}>
          {hovered && videoSrc ? (
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white select-none text-center px-3 capitalize">
                {sign.word}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm">{sign.word}</h3>
            {user && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(sign.id);
                }}
                className="z-10 group/btn p-1 -m-1"
              >
                <Heart 
                  className={`w-4 h-4 transition-colors ${
                    isFav 
                      ? 'text-rose-500 fill-rose-500' 
                      : 'text-white/20 group-hover/btn:text-rose-400 group-hover/btn:fill-rose-400/20'
                  }`} 
                />
              </button>
            )}
          </div>
          <span className={`text-xs font-mono ${difficultyColor[sign.difficulty] ?? 'text-white/40'}`}>
            {difficultyLabel[sign.difficulty] ?? '●○○'}
          </span>
        </div>
      </div>
    </Link>
  );
}

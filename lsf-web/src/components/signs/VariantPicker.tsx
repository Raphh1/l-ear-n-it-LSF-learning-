'use client';

import { Hand, MessageSquareText } from 'lucide-react';

// Une vidéo sélectionnable : variante du signe ou définition signée
export interface PlayableVideo {
  url: string;
  thumbnailUrl: string | null;
  author: string | null;
  kind: 'sign' | 'definition';
}

const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

// Rangée de vignettes : un clic joue la vidéo dans le lecteur associé
export function VariantPicker({
  videos,
  selectedUrl,
  onSelect,
}: {
  videos: PlayableVideo[];
  selectedUrl: string | null;
  onSelect: (v: PlayableVideo) => void;
}) {
  let signIndex = 0;
  return (
    <div className="flex flex-wrap gap-4">
      {videos.map((v, i) => {
        const active = v.url === selectedUrl;
        const label = v.kind === 'definition' ? 'Définition' : `Variante ${++signIndex}`;
        return (
          <button
            key={v.url}
            type="button"
            onClick={() => onSelect(v)}
            aria-pressed={active}
            aria-label={v.kind === 'definition' ? 'Voir la définition en LSF' : `Voir la variante ${signIndex}`}
            className={`flex w-24 flex-col items-center gap-1 border-[3px] border-ink p-1.5 transition-transform hover:-translate-y-1 ${
              active ? 'bg-sun shadow-hard' : 'bg-white shadow-hard-sm'
            } ${TILTS[i % TILTS.length]}`}
          >
            <span className="relative flex h-16 w-full items-center justify-center overflow-hidden border-2 border-ink bg-paper">
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : v.kind === 'definition' ? (
                <MessageSquareText className="h-7 w-7 text-ink/40" />
              ) : (
                <Hand className="h-7 w-7 text-ink/40" />
              )}
            </span>
            <span className="text-xs font-extrabold uppercase">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Lecteur simple, recréé à chaque changement de vidéo
export function VideoPlayer({ url, className = '' }: { url: string; className?: string }) {
  return <video key={url} src={url} controls autoPlay loop muted playsInline className={`w-full ${className}`} />;
}

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SignMeaning } from '@/lib/types';
import { VariantPicker, VideoPlayer, type PlayableVideo } from './VariantPicker';

export function toPlayable(meaning: SignMeaning): PlayableVideo[] {
  const videos: PlayableVideo[] = meaning.videos.map((v) => ({
    url: v.videoUrl, thumbnailUrl: v.thumbnailUrl, author: v.author, kind: 'sign',
  }));
  if (meaning.definitionVideoUrl) {
    videos.push({ url: meaning.definitionVideoUrl, thumbnailUrl: meaning.definitionThumbnailUrl, author: null, kind: 'definition' });
  }
  return videos;
}

// Un homonyme, replié par défaut : son signe est différent de celui de la fiche
function MeaningItem({ meaning, index }: { meaning: SignMeaning; index: number }) {
  const [open, setOpen] = useState(false);
  const videos = toPlayable(meaning);
  const [selected, setSelected] = useState<PlayableVideo>(videos[0]);

  return (
    <div className="panel-flat">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink bg-ocean font-display font-extrabold text-white">
          {index}
        </span>
        <span className="min-w-0 flex-1 font-bold">{meaning.definition ?? 'Sens sans définition'}</span>
        <span className="sticker hidden shrink-0 bg-white sm:inline-flex">
          {meaning.videos.length} signe{meaning.videos.length > 1 ? 's' : ''}
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="grid gap-5 border-t-[3px] border-ink p-4 sm:grid-cols-[minmax(0,18rem)_1fr]">
          <div className="border-[3px] border-ink bg-white">
            <VideoPlayer url={selected.url} />
          </div>
          <div className="flex flex-col gap-3">
            {videos.length > 1 && <VariantPicker videos={videos} selectedUrl={selected.url} onSelect={setSelected} />}
            {selected.author && <p className="text-sm text-ink/70">Source : {selected.author}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function OtherMeanings({ word, meanings, hasPrimary }: { word: string; meanings: SignMeaning[]; hasPrimary: boolean }) {
  if (meanings.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold">
          {hasPrimary ? <>Autres sens de « {word} »</> : <>Les sens de « {word} »</>}
        </h2>
        <p className="text-ink/75">
          {hasPrimary
            ? 'Même mot en français, mais un signe différent en LSF : attention à ne pas les confondre.'
            : 'En LSF, chaque sens de ce mot a son propre signe.'}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {meanings.map((m, i) => <MeaningItem key={m.videos[0]?.videoUrl ?? i} meaning={m} index={i + 1} />)}
      </div>
    </section>
  );
}

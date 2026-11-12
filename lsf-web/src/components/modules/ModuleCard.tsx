import Link from 'next/link';
import { ArrowRight, MessageSquareText } from 'lucide-react';
import type { Module } from '@/lib/types';
import { LevelMeter } from '@/components/brand/LevelMeter';

export function ModuleCard({ module }: { module: Module }) {
  const isPhrases = module.hasPhraseLessons;

  return (
    <Link href={`/modules/${module.id}`} className="panel press group flex h-full flex-col">
      <div className={`flex items-center justify-between gap-2 border-b-[3px] border-ink px-4 py-2 ${isPhrases ? 'bg-ocean text-white' : 'bg-sun'}`}>
        <span className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider">
          {isPhrases ? <><MessageSquareText className="h-4 w-4" /> Phrases</> : 'Vocabulaire'}
        </span>
        <span className="font-display font-bold">
          {module.lessonCount} leçon{module.lessonCount > 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-2xl font-extrabold leading-tight">{module.title}</h3>
        {module.description && (
          <p className="line-clamp-2 leading-snug text-ink/75">{module.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <LevelMeter level={module.level} />
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
}

import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';
import type { Module } from '@/lib/types';

const levelColors: Record<number, string> = {
  1: 'from-emerald-500 to-teal-500',
  2: 'from-violet-500 to-indigo-600',
  3: 'from-rose-500 to-orange-400',
};

const levelLabels: Record<number, string> = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Avancé',
};

export function ModuleCard({ module }: { module: Module }) {
  const gradient = module.hasPhraseLessons
    ? 'from-teal-500 to-emerald-500'
    : levelColors[module.level] ?? levelColors[1];
  const label = module.hasPhraseLessons ? 'Phrases' : levelLabels[module.level] ?? 'Débutant';

  return (
    <Link href={`/modules/${module.id}`}>
      <div className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-200 hover:scale-[1.02] cursor-pointer overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

        <div className="flex items-start justify-between gap-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white font-bold text-sm shrink-0`}>
            {module.hasPhraseLessons ? '💬' : module.level}
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r ${gradient} bg-opacity-20 text-white`}>
            {label}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-white font-semibold text-base leading-snug group-hover:text-white transition-colors">
            {module.title}
          </h3>
          {module.description && (
            <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{module.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-white/30">
            {module.lessonCount} leçon{module.lessonCount > 1 ? 's' : ''}
          </span>
          {module.hasPhraseLessons && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-400 text-[10px] font-semibold">
              <MessageSquareText className="w-3 h-3" />
              Entraînement phrases
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

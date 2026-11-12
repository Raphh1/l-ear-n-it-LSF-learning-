'use client';

import type { Module } from '@/lib/types';
import { ModuleCard } from '@/components/modules/ModuleCard';

function dateHash(date: string): number {
  return Math.abs(date.split('').reduce((acc, c) => (Math.imul(acc, 31) + c.charCodeAt(0)) | 0, 0));
}

export function getDailyModules(modules: Module[]): Module[] {
  const today = new Date().toISOString().split('T')[0];
  const seed  = dateHash(today);

  return ([1, 2, 3] as const).flatMap(level => {
    const pool = modules.filter(m => m.level === level && !m.hasPhraseLessons && m.lessonCount > 0);
    if (pool.length === 0) return [];
    return [pool[seed % pool.length]];
  });
}

interface Props {
  modules: Module[];
  isLoading: boolean;
  inline?: boolean;
}

const tilts = ['-rotate-1', 'rotate-1', '-rotate-1'];

export function DailyModules({ modules, isLoading, inline }: Props) {
  const daily = getDailyModules(modules);

  return (
    <section className={inline ? '' : 'px-6 py-20'}>
      <div className={inline ? 'flex flex-col gap-6' : 'mx-auto flex max-w-6xl flex-col gap-10'}>
        <div className="flex flex-col gap-3">
          <span className="sticker w-fit rotate-1 bg-mint">Sélection du jour</span>
          <h2 className="text-4xl font-extrabold sm:text-5xl">Modules du jour</h2>
          <p className="max-w-md text-lg text-ink/80">
            Un module par niveau, renouvelé chaque jour.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-52" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {daily.map((module, i) => (
              <div key={module.id} className={tilts[i]}>
                <ModuleCard module={module} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

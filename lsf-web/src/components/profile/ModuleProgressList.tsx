'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { type ModuleProgress } from '@/lib/profile';
import { LevelMeter } from '@/components/brand/LevelMeter';

interface Props {
  moduleProgress: ModuleProgress[];
  totalModules: number;
  modulesStarted: number;
  isLoading: boolean;
}

export function ModuleProgressList({ moduleProgress, totalModules, modulesStarted, isLoading }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold">Progression par module</h2>
        <span className="sticker bg-white">
          {isLoading ? '—' : `${modulesStarted}/${totalModules} commencé${modulesStarted > 1 ? 's' : ''}`}
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20" />)}
        </div>
      ) : moduleProgress.length === 0 ? (
        <div className="panel p-6 text-center font-bold">Aucun module disponible.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {moduleProgress.map((item) => {
            const done = item.percent === 100;
            return (
              <Link key={item.module.id} href={`/modules/${item.module.id}`} className={`panel-flat group flex items-center gap-4 p-4 hover:shadow-hard ${done ? 'bg-mint' : ''}`}>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-display text-lg font-extrabold">{item.module.title}</span>
                    <LevelMeter level={item.module.level} showLabel={false} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bar flex-1"><span className={done ? 'bg-ink' : 'bg-sun'} style={{ width: `${item.percent}%` }} /></div>
                    <span className="shrink-0 font-bold tabular-nums">{item.completedLessons}/{item.totalLessons}</span>
                  </div>
                </div>
                {done && <span className="sticker shrink-0 bg-white">Terminé</span>}
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

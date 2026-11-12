'use client';

import { Star } from 'lucide-react';
import { levelLabels } from '@/lib/profile';

interface Props {
  level: number;
  xpTotal: number;
  xpInLevel: number;
  xpForNext: number;
  isLoading: boolean;
}

export function ProfileXpBar({ level, xpTotal, xpInLevel, xpForNext, isLoading }: Props) {
  return (
    <div className="panel flex flex-col gap-4 bg-ocean p-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold uppercase tracking-widest">Niveau {level}</span>
          <span className="font-display text-3xl font-extrabold">
            {isLoading ? '—' : levelLabels[level <= 3 ? level : 3]}
          </span>
        </div>
        <span className="tile rotate-2 bg-sun text-xl text-ink">
          <Star className="mr-2 h-5 w-5 fill-ink" /> {isLoading ? '—' : xpTotal} XP
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="bar h-6 bg-white">
          <span className="bg-sun" style={{ width: isLoading ? '0%' : `${(xpInLevel / xpForNext) * 100}%` }} />
        </div>
        <div className="flex justify-between text-sm font-bold">
          <span>{xpInLevel} XP</span>
          <span>{xpForNext} XP pour le niveau {level + 1}</span>
        </div>
      </div>
    </div>
  );
}

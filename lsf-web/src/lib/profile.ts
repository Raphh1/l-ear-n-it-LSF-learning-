import type { Module } from '@/lib/types';

export interface ModuleProgress {
  module: Module;
  completedLessons: number;
  totalLessons: number;
  percent: number;
}

export function getLevelFromXp(xp: number) {
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const xpForNext = 100;
  return { level, xpInLevel, xpForNext };
}

export const levelLabels: Record<number, string> = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Avancé',
};

export const levelColors: Record<number, string> = {
  1: 'from-emerald-500 to-teal-500',
  2: 'from-violet-500 to-indigo-600',
  3: 'from-rose-500 to-orange-400',
};

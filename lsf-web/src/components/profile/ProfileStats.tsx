'use client';

import Link from 'next/link';
import { Flame, BookOpen, Trophy, Heart } from 'lucide-react';

interface Props {
  streakDays: number;
  lessonsCompleted: number;
  modulesCompleted: number;
  totalModules: number;
  favoriteCount: number;
  isLoading: boolean;
}

export function ProfileStats({
  streakDays, lessonsCompleted, modulesCompleted, totalModules, favoriteCount, isLoading,
}: Props) {
  const stats = [
    { icon: Flame, label: 'Série en cours', value: isLoading ? '—' : `${streakDays} j`, color: 'bg-tomato', tilt: '-rotate-1' },
    { icon: BookOpen, label: 'Leçons complétées', value: isLoading ? '—' : String(lessonsCompleted), color: 'bg-sun', tilt: 'rotate-1' },
    { icon: Trophy, label: 'Modules terminés', value: isLoading ? '—' : `${modulesCompleted}/${totalModules}`, color: 'bg-mint', tilt: '-rotate-1' },
  ];

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, color, tilt }) => (
        <div key={label} className={`panel flex flex-col gap-3 p-5 ${color} ${tilt}`}>
          <Icon className="h-6 w-6" strokeWidth={2.5} />
          <div className="flex flex-col">
            <span className="font-display text-4xl font-extrabold leading-none">{value}</span>
            <span className="mt-1 text-sm font-bold">{label}</span>
          </div>
        </div>
      ))}

      <Link href="/favorites" className="panel press flex flex-col gap-3 p-5 rotate-1">
        <Heart className="h-6 w-6 fill-tomato" strokeWidth={2.5} />
        <div className="mt-auto flex flex-col">
          <span className="font-display text-4xl font-extrabold leading-none">{favoriteCount}</span>
          <span className="mt-1 text-sm font-bold">Mes favoris →</span>
        </div>
      </Link>
    </div>
  );
}

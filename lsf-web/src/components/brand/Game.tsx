import Link from 'next/link';
import { ArrowLeft, Star, Trophy, type LucideIcon } from 'lucide-react';

// En-tête des écrans de jeu : retour, nom du jeu en étiquette, info à droite (score, chrono…)
export function GameHeader({
  backHref = '/jeux',
  backLabel = 'Jeux',
  title,
  color = 'bg-tomato',
  right,
}: {
  backHref?: string;
  backLabel?: string;
  title: string;
  color?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link href={backHref} className="btn btn-ghost btn-sm -ml-1 px-2">
        <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> {backLabel}
      </Link>
      <span className={`sticker -rotate-2 text-sm ${color}`}>{title}</span>
      <div className="flex min-w-16 justify-end font-display text-lg font-extrabold">{right}</div>
    </div>
  );
}

// Barre de progression d'une partie
export function GameProgress({ value, color = 'bg-sun' }: { value: number; color?: string }) {
  return (
    <div className="bar h-4">
      <span className={color} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

// Écran de fin de partie
export function GameEnd({
  title,
  subtitle,
  color = 'bg-sun',
  icon: Icon = Trophy,
  xp,
  children,
  extra,
}: {
  title: string;
  subtitle?: React.ReactNode;
  color?: string;
  icon?: LucideIcon;
  xp?: number;
  children?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-7 py-6 text-center">
      <span className={`flex h-24 w-24 -rotate-6 items-center justify-center border-[3px] border-ink shadow-hard-lg ${color}`}>
        <Icon className="h-12 w-12" strokeWidth={2.5} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-extrabold leading-none">{title}</h1>
        {subtitle && <div className="text-lg font-bold">{subtitle}</div>}
      </div>
      {xp !== undefined && xp > 0 && (
        <span className="tile rotate-2 bg-sun text-xl">
          <Star className="mr-2 h-5 w-5 fill-ink" /> +{xp} XP
        </span>
      )}
      {extra}
      {children && <div className="flex w-full max-w-md flex-col items-stretch gap-4 sm:flex-row">{children}</div>}
    </div>
  );
}

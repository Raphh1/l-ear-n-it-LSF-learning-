'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Target, BookOpen, Check, X } from 'lucide-react';
import type { GlobalStats } from '@/lib/types';

interface Props {
  stats: GlobalStats | null;
  isLoading: boolean;
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="panel-flat flex flex-col gap-3 p-5">
      <span className={`flex h-10 w-10 items-center justify-center border-2 border-ink ${color}`}>{icon}</span>
      <div>
        <p className="font-display text-3xl font-extrabold leading-none">{value}</p>
        <p className="mt-1 text-sm font-bold">{label}</p>
        {sub && <p className="text-sm text-ink/70">{sub}</p>}
      </div>
    </div>
  );
}

function SignBadge({ label, word, slug, icon, color }: { label: string; word: string; slug: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest">{icon} {label}</span>
      <Link href={`/dictionnaire/${slug}`} className={`tile w-fit text-lg capitalize ${color}`}>{word}</Link>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ProfileGlobalStats({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-extrabold">Statistiques</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32" />)}
        </div>
      </section>
    );
  }

  if (!stats || stats.totalSignsPracticed === 0) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-extrabold">Statistiques</h2>
        <div className="panel p-6 text-center">
          <p className="font-bold">Aucune pratique enregistrée pour l&apos;instant.</p>
          <p className="mt-1 text-ink/75">Lance-toi dans un jeu ou une leçon pour voir tes stats ici.</p>
        </div>
      </section>
    );
  }

  const total = stats.totalCorrect + stats.totalWrong;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-3xl font-extrabold">Statistiques</h2>
        {stats.lastPracticeAt && <span className="text-sm font-bold">Dernière pratique : {formatDate(stats.lastPracticeAt)}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Signes pratiqués" value={stats.totalSignsPracticed} color="bg-sun" />
        <StatCard icon={<Target className="h-5 w-5" />} label="Taux de réussite" value={`${stats.successRate}%`} sub={`${total} tentatives`} color="bg-ocean text-white" />
        <StatCard icon={<Check className="h-5 w-5" strokeWidth={3} />} label="Bonnes réponses" value={stats.totalCorrect} color="bg-mint" />
        <StatCard icon={<X className="h-5 w-5" strokeWidth={3} />} label="Erreurs" value={stats.totalWrong} color="bg-tomato" />
      </div>

      <div className="panel p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest">Réussite globale</p>
        <div className="flex items-center gap-3">
          <div className="bar h-6 flex-1"><span className="bg-mint" style={{ width: `${Math.min(stats.successRate, 100)}%` }} /></div>
          <span className="w-14 text-right font-display text-xl font-extrabold">{stats.successRate}%</span>
        </div>

        {(stats.bestSignWord || stats.hardestSignWord) && (
          <div className="mt-5 flex flex-wrap gap-8 border-t-[3px] border-ink pt-5">
            {stats.bestSignWord && stats.bestSignSlug && (
              <SignBadge label="Mieux maîtrisé" word={stats.bestSignWord} slug={stats.bestSignSlug} icon={<TrendingUp className="h-4 w-4" />} color="-rotate-2 bg-mint" />
            )}
            {stats.hardestSignWord && stats.hardestSignSlug && (
              <SignBadge label="À retravailler" word={stats.hardestSignWord} slug={stats.hardestSignSlug} icon={<TrendingDown className="h-4 w-4" />} color="rotate-2 bg-tomato" />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowDown, MessageSquareText, Search, X, Hand } from 'lucide-react';
import Link from 'next/link';
import { modulesApi } from '@/lib/api/modules';
import { ModuleCard } from '@/components/modules/ModuleCard';
import { DailyModules } from '@/components/home/DailyModules';
import { PageHeader } from '@/components/brand/PageHeader';
import { LevelMeter } from '@/components/brand/LevelMeter';
import type { Module } from '@/lib/types';

const levelConfig: Record<number, { id: string; label: string; description: string }> = {
  1: {
    id: 'debutant',
    label: 'Débutant',
    description: 'Aucune connaissance en LSF requise. Commence par les bases : alphabet, salutations, chiffres et expressions courantes.',
  },
  2: {
    id: 'intermediaire',
    label: 'Intermédiaire',
    description: 'Tu maîtrises les bases ? Enrichis ton vocabulaire avec des thématiques plus variées.',
  },
  3: {
    id: 'avance',
    label: 'Avancé',
    description: 'Pour aller plus loin : expressions complexes, nuances et vocabulaire spécialisé.',
  },
};

const steps = [
  { num: '1', text: 'Choisis un module selon ton niveau', color: 'bg-sun' },
  { num: '2', text: 'Apprends les signes leçon par leçon', color: 'bg-mint' },
  { num: '3', text: 'Entraîne-toi avec les jeux', color: 'bg-tomato' },
];

const navLevels = [
  { id: 'debutant', label: 'Débutant' },
  { id: 'intermediaire', label: 'Intermédiaire' },
  { id: 'avance', label: 'Avancé' },
  { id: 'phrases-section', label: 'Phrases' },
];

function SectionTitle({ title, count, children }: { title: React.ReactNode; count: number; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b-[3px] border-ink pb-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-extrabold sm:text-4xl">{title}</h2>
        <span className="sticker bg-white">{count} module{count > 1 ? 's' : ''}</span>
      </div>
      {children && <p className="max-w-2xl text-ink/80">{children}</p>}
    </div>
  );
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    modulesApi.getAll()
      .then(setModules)
      .finally(() => setIsLoading(false));
  }, []);

  const q = search.trim().toLowerCase();

  const phraseModules = modules
    .filter((m) => m.hasPhraseLessons)
    .filter((m) => !q || m.title.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const byLevel = (level: number) => modules
    .filter((m) => m.level === level && !m.hasPhraseLessons)
    .filter((m) => !q || m.title.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const totalResults = q ? [1, 2, 3].reduce((acc, l) => acc + byLevel(l).length, 0) + phraseModules.length : null;

  return (
    <div className="px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <div className="flex flex-col gap-8">
          <PageHeader kicker="Apprendre" title="Modules d'apprentissage">
            Apprends la LSF à ton rythme, du vocabulaire de base jusqu&apos;aux expressions avancées.
          </PageHeader>

          {/* Étapes */}
          <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            {steps.map((step, i) => (
              <li key={step.num} className="flex items-center gap-2">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center border-[3px] border-ink font-display font-extrabold ${step.color}`}>
                  {step.num}
                </span>
                <span className="font-bold">{step.text}</span>
                {i < steps.length - 1 && <ArrowRight className="mx-2 hidden h-5 w-5 sm:block" strokeWidth={2.5} />}
              </li>
            ))}
          </ol>
        </div>

        {/* Recherche + navigation niveaux */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" strokeWidth={2.5} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un module..."
              className="field py-4 pl-12 pr-12 text-lg"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-2 border-ink bg-white p-1 hover:bg-sun"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!search && (
            <nav className="flex flex-wrap gap-3">
              {navLevels.map((nav) => (
                <a
                  key={nav.id}
                  href={`#${nav.id}`}
                  className={`btn btn-sm ${nav.id === 'phrases-section' ? 'btn-ocean' : ''}`}
                >
                  {nav.id === 'phrases-section' && <MessageSquareText className="h-4 w-4" />}
                  {nav.label}
                </a>
              ))}
            </nav>
          )}

          {search && totalResults !== null && (
            <p className="font-bold">
              {totalResults === 0 ? 'Aucun module trouvé' : `${totalResults} module${totalResults > 1 ? 's' : ''} trouvé${totalResults > 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {/* Modules du jour */}
        {!search && !isLoading && (
          <DailyModules modules={modules} isLoading={isLoading} inline />
        )}

        {/* Conseil débutant */}
        {!search && (
          <div className="panel flex items-start gap-4 bg-mint p-5">
            <Hand className="h-8 w-8 shrink-0" strokeWidth={2.5} />
            <div className="flex flex-col gap-1">
              <p className="font-display text-xl font-extrabold">Tu débutes en LSF ?</p>
              <p className="leading-relaxed">
                Commence par les modules <strong>Débutant</strong> : alphabet, salutations et chiffres, les bases indispensables pour communiquer.
                Pas besoin de connaissances préalables.
              </p>
              <Link href="#debutant" className="link mt-1 flex w-fit items-center gap-1">
                Voir les modules Débutant <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Niveaux */}
        {isLoading ? (
          <div className="flex flex-col gap-10">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="skeleton h-10 w-64" />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, j) => <div key={j} className="skeleton h-52" />)}
                </div>
              </div>
            ))}
          </div>
        ) : modules.length === 0 ? (
          <p className="panel py-20 text-center font-bold">Aucun module disponible pour l&apos;instant.</p>
        ) : (
          <div className="flex flex-col gap-16">
            {[1, 2, 3].map((level) => {
              const items = byLevel(level);
              if (items.length === 0) return null;
              const config = levelConfig[level];
              return (
                <section key={level} id={config.id} className="flex scroll-mt-24 flex-col gap-6">
                  <SectionTitle
                    title={<span className="flex items-center gap-3">{config.label} <LevelMeter level={level} showLabel={false} /></span>}
                    count={items.length}
                  >
                    {config.description}
                  </SectionTitle>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((module, idx) => (
                      <div key={module.id} className="relative">
                        {level === 1 && idx === 0 && (
                          <span className="tile absolute -top-4 right-4 z-10 rotate-3 bg-tomato text-sm">
                            Commence ici !
                          </span>
                        )}
                        <ModuleCard module={module} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Section Phrases */}
        {!isLoading && phraseModules.length > 0 && (
          <section id="phrases-section" className="flex scroll-mt-24 flex-col gap-6">
            <SectionTitle
              title={<span className="flex items-center gap-3"><MessageSquareText className="h-8 w-8" strokeWidth={2.5} /> Construction de phrases</span>}
              count={phraseModules.length}
            >
              Construis des phrases complètes en LSF, avec la grammaire visuelle propre à la langue des signes.
            </SectionTitle>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {phraseModules.map((module) => <ModuleCard key={module.id} module={module} />)}
            </div>
          </section>
        )}
      </div>

      {/* Raccourci vers les phrases */}
      <button
        onClick={() => {
          const phraseSection = document.getElementById('phrases-section');
          if (phraseSection) {
            phraseSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }
        }}
        className="btn btn-ocean fixed bottom-6 right-6 z-40"
        title="Aller aux Phrases"
      >
        <span className="hidden sm:block">Phrases</span>
        <ArrowDown className="h-5 w-5" />
      </button>
    </div>
  );
}

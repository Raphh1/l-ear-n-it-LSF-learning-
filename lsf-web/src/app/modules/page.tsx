'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Trophy, ArrowRight, ArrowDown, ChevronRight, MessageSquareText } from 'lucide-react';
import Link from 'next/link';
import { modulesApi } from '@/lib/api/modules';
import { ModuleCard } from '@/components/modules/ModuleCard';
import type { Module } from '@/lib/types';

const levelConfig: Record<number, {
  label: string;
  description: string;
  tip: string;
  gradient: string;
  icon: React.ReactNode;
}> = {
  1: {
    label: 'Débutant',
    description: 'Aucune connaissance en LSF requise. Commence par les bases : alphabet, salutations, chiffres et expressions courantes.',
    tip: 'Commence ici si tu débutes.',
    gradient: 'from-emerald-500 to-teal-500',
    icon: <BookOpen className="w-5 h-5" />,
  },
  2: {
    label: 'Intermédiaire',
    description: 'Tu maîtrises les bases ? Enrichis ton vocabulaire avec des thématiques plus variées et des constructions de phrases.',
    tip: 'Recommandé après le niveau Débutant.',
    gradient: 'from-violet-500 to-indigo-600',
    icon: <Zap className="w-5 h-5" />,
  },
  3: {
    label: 'Avancé',
    description: 'Pour ceux qui veulent aller plus loin : expressions complexes, nuances et vocabulaire spécialisé.',
    tip: 'Pour les apprenants expérimentés.',
    gradient: 'from-rose-500 to-orange-400',
    icon: <Trophy className="w-5 h-5" />,
  },
};

const steps = [
  { num: '1', text: 'Choisis un module selon ton niveau' },
  { num: '2', text: 'Apprends les signes leçon par leçon' },
  { num: '3', text: 'Entraîne-toi avec les jeux interactifs' },
];

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    modulesApi.getAll()
      .then(setModules)
      .finally(() => setIsLoading(false));
  }, []);

  const phraseModules = modules
    .filter((m) => m.hasPhraseLessons)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const byLevel = (level: number) => modules
    .filter((m) => m.level === level && !m.hasPhraseLessons)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const levels = [1, 2, 3].filter((l) => !isLoading && byLevel(l).length > 0 || isLoading);

  return (
    <div className="min-h-screen bg-[#0a0a1a] px-6 py-16">
      <div className="max-w-5xl mx-auto flex flex-col gap-14">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-white">Modules d&apos;apprentissage</h1>
            <p className="text-white/40 text-base max-w-xl">
              Apprends la Langue des Signes Française à ton rythme, du vocabulaire de base jusqu&apos;aux expressions avancées.
            </p>
          </div>

          {/* Étapes */}
          <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-bold shrink-0">
                    {step.num}
                  </span>
                  <span className="text-white/50 text-sm">{step.text}</span>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-white/20 shrink-0 hidden sm:block mx-2" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Conseil débutant */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4"
        >
          <span className="text-2xl shrink-0">👋</span>
          <div className="flex flex-col gap-1">
            <p className="text-emerald-300 font-semibold text-sm">Tu débutes en LSF ?</p>
            <p className="text-white/50 text-sm leading-relaxed">
              Commence par les modules <span className="text-white/70 font-medium">Débutant</span> — ils couvrent l&apos;alphabet, les salutations et les chiffres, les bases indispensables pour communiquer. Pas besoin de connaissances préalables.
            </p>
            <Link
              href="#debutant"
              className="mt-1 flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors w-fit"
            >
              Voir les modules Débutant <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Niveaux */}
        {isLoading ? (
          <div className="flex flex-col gap-10">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="h-5 w-32 rounded-lg bg-white/5 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-44 rounded-2xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : modules.length === 0 ? (
          <p className="text-white/30 text-center py-20">Aucun module disponible pour l&apos;instant.</p>
        ) : (
          <div className="flex flex-col gap-12">
            {[1, 2, 3].map((level) => {
              const items = byLevel(level);
              if (items.length === 0) return null;
              const config = levelConfig[level];
              return (
                <motion.section
                  key={level}
                  id={level === 1 ? 'debutant' : level === 2 ? 'intermediaire' : 'avance'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: level * 0.08 }}
                  className="flex flex-col gap-5"
                >
                  {/* Section header */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br ${config.gradient} text-white`}>
                        {config.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-white font-bold text-xl">{config.label}</h2>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${config.gradient} text-white opacity-80`}>
                          {items.length} module{items.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/40 text-sm max-w-xl pl-11">{config.description}</p>
                  </div>

                  {/* Modules grid */}
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
                  >
                    {items.map((module, idx) => (
                      <motion.div
                        key={module.id}
                        variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        {level === 1 && idx === 0 && (
                          <div className="absolute -top-2 left-4 z-10 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                            ★ Par ici pour commencer
                          </div>
                        )}
                        <ModuleCard module={module} />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>
              );
            })}
          </div>
        )}

        {/* Section Phrases */}
        {!isLoading && phraseModules.length > 0 && (
          <motion.section
            id="phrases-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold text-xl">Construction de phrases</h2>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white opacity-80">
                    {phraseModules.length} module{phraseModules.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <p className="text-white/40 text-sm max-w-xl pl-11">
                Apprends à construire des phrases complètes en LSF — avec la grammaire visuo-gestuelle propre à la langue des signes.
              </p>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
            >
              {phraseModules.map((module) => (
                <motion.div
                  key={module.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.3 }}
                >
                  <ModuleCard module={module} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

      </div>

      {/* Bouton pour scroller tout en bas */}
      <button
        onClick={() => {
          const phraseSection = document.getElementById('phrases-section');
          if (phraseSection) {
            phraseSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }
        }}
        className="fixed z-50 bottom-8 right-8 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg hover:scale-105 transition-transform"
        title="Aller aux Phrases"
      >
        <span className="font-semibold text-sm hidden sm:block">Phrases</span>
        <ArrowDown className="w-5 h-5" />
      </button>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { modulesApi } from '@/lib/api/modules';
import type { Module } from '@/lib/types';

const levelLabel: Record<number, string> = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Avancé',
};

const levelColor: Record<number, string> = {
  1: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  2: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  3: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

export default function QuizIndexPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    modulesApi.getAll()
      .then(setModules)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      {/* Blobs de fond */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative max-w-5xl mx-auto flex flex-col gap-12">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Quiz</h1>
          </div>
          <p className="text-white/40 max-w-md">
            Choisissez un module, sélectionnez une leçon et testez vos connaissances.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <p className="text-white/30 text-center py-20">Aucun module disponible pour l&apos;instant.</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
          >
            {modules.map((module) => (
              <motion.div
                key={module.id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.35 }}
              >
                <Link href={`/modules/${module.id}`}>
                  <div className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/8 hover:border-white/20 hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-white font-semibold text-base leading-snug">{module.title}</h2>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border ${levelColor[module.level] ?? 'text-white/40 bg-white/5 border-white/10'}`}>
                        {levelLabel[module.level] ?? 'Niveau ' + module.level}
                      </span>
                    </div>

                    {module.description && (
                      <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{module.description}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-white/30 text-xs">
                        {module.lessonCount} leçon{module.lessonCount > 1 ? 's' : ''}
                      </span>
                      <span className="text-violet-400 text-xs font-medium group-hover:text-violet-300 transition-colors">
                        Choisir une leçon →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
}

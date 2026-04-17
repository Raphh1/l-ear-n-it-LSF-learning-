'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, ChevronUp, BookOpen, Lock } from 'lucide-react';
import { modulesApi } from '@/lib/api/modules';
import type { Module, LessonSummary, ModuleDetail } from '@/lib/types';

const GAME_LABELS: Record<string, { title: string; icon: string; color: string }> = {
  quiz:         { title: 'Quiz',                   icon: '🎯', color: 'from-violet-500 to-indigo-600' },
  vitesse:      { title: 'Vitesse',                icon: '⚡', color: 'from-amber-500 to-orange-500'  },
  inverse:      { title: 'Mode inversé',           icon: '🔄', color: 'from-emerald-500 to-teal-500' },
  memoire:      { title: 'Mémoire',                icon: '🧠', color: 'from-rose-500 to-pink-500'    },
  survie:       { title: 'Survie',                 icon: '⏳', color: 'from-cyan-500 to-blue-500'    },
  revision:     { title: 'Révision',               icon: '📖', color: 'from-orange-500 to-red-500'   },
  constructeur: { title: 'Constructeur de phrases',icon: '💬', color: 'from-teal-500 to-emerald-500' },
};

interface AccordionItemProps {
  module: Module;
  game: string;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ module, game, isOpen, onToggle }: AccordionItemProps) {
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

  function handleToggle() {
    onToggle();
    if (!lessons && !isLoadingLessons) {
      setIsLoadingLessons(true);
      modulesApi.getById(module.id)
        .then((detail: ModuleDetail) => setLessons(detail.lessons))
        .finally(() => setIsLoadingLessons(false));
    }
  }

  const levelLabel = ['Débutant', 'Intermédiaire', 'Avancé'][module.level - 1] ?? `Niveau ${module.level}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header accordéon */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-white font-semibold truncate">{module.title}</span>
          <span className="text-white/30 text-xs">{levelLabel} · {module.lessonCount} leçon{module.lessonCount !== 1 ? 's' : ''}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-white/40 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
        )}
      </button>

      {/* Leçons */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="lessons"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-5 py-3 flex flex-col gap-2">
              {isLoadingLessons ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </>
              ) : lessons && lessons.length > 0 ? (() => {
                const isPhraseGame = game === 'constructeur';
                const filtered = lessons
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .filter((l) => isPhraseGame
                    ? l.lessonType === 'phrases'
                    : l.lessonType !== 'phrases'
                  );

                if (filtered.length === 0) {
                  return (
                    <p className="text-white/30 text-sm py-2">
                      {isPhraseGame
                        ? 'Aucune leçon de phrases dans ce module.'
                        : 'Aucune leçon disponible.'}
                    </p>
                  );
                }

                return filtered.map((lesson) => {
                  const disabled = isPhraseGame
                    ? lesson.phraseCount < 1
                    : lesson.signCount < 2;
                  const countLabel = isPhraseGame
                    ? `${lesson.phraseCount} phrase${lesson.phraseCount !== 1 ? 's' : ''}`
                    : `${lesson.signCount} signe${lesson.signCount !== 1 ? 's' : ''}`;

                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/5 bg-white/3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <BookOpen className="w-4 h-4 text-white/30 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-white/80 text-sm font-medium truncate">{lesson.title}</span>
                          <span className="text-white/30 text-xs">{countLabel} · {lesson.xpReward} XP</span>
                        </div>
                      </div>
                      {disabled ? (
                        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-white/20 text-xs font-medium cursor-not-allowed shrink-0">
                          <Lock className="w-3 h-3" />
                          Jouer
                        </div>
                      ) : (
                        <Link
                          href={`/jeux/${game}/${lesson.id}`}
                          className={`px-4 py-1.5 rounded-full text-white text-xs font-semibold hover:scale-[1.03] transition-transform shrink-0 bg-gradient-to-r ${
                            isPhraseGame
                              ? 'from-teal-500 to-emerald-500'
                              : 'from-violet-600 to-indigo-600'
                          }`}
                        >
                          Jouer
                        </Link>
                      )}
                    </div>
                  );
                });
              })() : (
                <p className="text-white/30 text-sm py-2">Aucune leçon disponible.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GameLessonSelectPage() {
  const { game } = useParams<{ game: string }>();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModuleId, setOpenModuleId] = useState<number | null>(null);

  // Jeux sans sélection de leçon — redirection directe
  const STANDALONE_GAMES = ['defi', 'classement'];
  if (STANDALONE_GAMES.includes(game)) {
    router.replace(`/jeux/${game}`);
    return null;
  }

  const gameInfo = GAME_LABELS[game] ?? { title: game, icon: '🎮', color: 'from-violet-500 to-indigo-600' };

  useEffect(() => {
    modulesApi.getAll()
      .then((data) => {
        setModules(data);
        if (data.length > 0) setOpenModuleId(data[0].id);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      {/* Blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative max-w-2xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2"
        >
          <Link
            href="/jeux"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Jeux
          </Link>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${gameInfo.color} text-xl shadow-lg`}
            >
              {gameInfo.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{gameInfo.title}</h1>
              <p className="text-white/40 text-sm">Choisis une leçon pour commencer</p>
            </div>
          </div>
        </motion.div>

        {/* Modules */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <p className="text-white/30 text-center py-20">Aucun module disponible.</p>
        ) : (
          <motion.div
            className="flex flex-col gap-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
          >
            {modules
              .slice()
              .filter((m) => game === 'constructeur' ? m.hasPhraseLessons : !m.hasPhraseLessons)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((module) => (
                <motion.div
                  key={module.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.3 }}
                >
                  <AccordionItem
                    module={module}
                    game={game}
                    isOpen={openModuleId === module.id}
                    onToggle={() => setOpenModuleId(openModuleId === module.id ? null : module.id)}
                  />
                </motion.div>
              ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

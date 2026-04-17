'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

const GAMES = [
  {
    slug: 'defi',
    title: 'Défi du jour',
    description: 'Un signe par jour, le même pour tout le monde. Une seule chance !',
    icon: '📅',
    color: 'from-yellow-500 to-amber-500',
    badge: 'Quotidien',
  },
  {
    slug: 'quiz',
    title: 'Quiz',
    description: "Un signe s'affiche, trouve le bon mot parmi 4 choix.",
    icon: '🎯',
    color: 'from-violet-500 to-indigo-600',
    badge: 'Classique',
  },
  {
    slug: 'vitesse',
    title: 'Vitesse',
    description: 'Réponds le plus vite possible — chaque seconde compte !',
    icon: '⚡',
    color: 'from-amber-500 to-orange-500',
    badge: 'Chrono',
  },
  {
    slug: 'inverse',
    title: 'Mode inversé',
    description: 'On te montre le mot, retrouve la bonne image parmi 4 signes.',
    icon: '🔄',
    color: 'from-emerald-500 to-teal-500',
    badge: 'Inversé',
  },
  {
    slug: 'memoire',
    title: 'Mémoire',
    description: 'Retrouve les paires image ↔ mot. Classique mais redoutable.',
    icon: '🧠',
    color: 'from-rose-500 to-pink-500',
    badge: 'Memory',
  },
  {
    slug: 'survie',
    title: 'Survie',
    description: 'Réponds avant que le temps ne s\'écoule — chaque bonne réponse te rapporte +5s.',
    icon: '⏳',
    color: 'from-cyan-500 to-blue-500',
    badge: 'Timer',
  },
  {
    slug: 'revision',
    title: 'Révision',
    description: 'Retravaille uniquement les signes sur lesquels tu t\'es trompé.',
    icon: '📖',
    color: 'from-orange-500 to-red-500',
    badge: 'Ciblé',
  },
  {
    slug: 'constructeur',
    title: 'Constructeur de phrases',
    description: 'Remets les signes dans le bon ordre LSF pour former une phrase complète.',
    icon: '💬',
    color: 'from-teal-500 to-emerald-500',
    badge: 'Phrases',
  },
];

export default function JeuxPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      {/* Blobs de fond */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative max-w-4xl mx-auto flex flex-col gap-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Accueil
          </Link>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-white">Jeux</h1>
            <Link
              href="/jeux/classement"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
            >
              🏆 Classement
            </Link>
          </div>
          <p className="text-white/40">Entraîne-toi avec différents modes de jeu pour mémoriser les signes.</p>
        </motion.div>

        {/* Grille des jeux */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
            hidden: {},
          }}
        >
          {GAMES.map((game) => (
            <motion.div
              key={game.slug}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.35 }}
            >
              <Link
                href={`/jeux/${game.slug}`}
                className="group block rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex flex-col gap-4">
                  {/* Badge + icon */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} text-2xl shadow-lg`}
                    >
                      {game.icon}
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50">
                      {game.badge}
                    </span>
                  </div>

                  {/* Titre + description */}
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors">
                      {game.title}
                    </h2>
                    <p className="text-white/40 text-sm leading-relaxed">{game.description}</p>
                  </div>

                  {/* CTA */}
                  <div
                    className={`mt-1 self-start text-sm font-semibold bg-gradient-to-r ${game.color} bg-clip-text text-transparent`}
                  >
                    Jouer →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

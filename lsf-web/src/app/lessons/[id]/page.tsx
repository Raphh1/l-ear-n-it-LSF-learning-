'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, HandMetal, Star } from 'lucide-react';
import { lessonsApi } from '@/lib/api/lessons';
import { LessonSignCard } from '@/components/signs/LessonSignCard';
import type { LessonDetail } from '@/lib/types';

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    lessonsApi.getById(id)
      .then(setLesson)
      .catch(() => router.push('/modules'))
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] px-6 py-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="h-5 w-36 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-10 w-72 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-4 w-48 rounded-lg bg-white/5 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      {/* Blobs de fond */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative max-w-4xl mx-auto flex flex-col gap-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <Link
            href={`/modules/${lesson.moduleId}`}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour au module
          </Link>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold text-white">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-white/40 text-sm max-w-xl">{lesson.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-white/30 mt-1">
              <span className="flex items-center gap-1.5">
                <HandMetal className="w-4 h-4" />
                {lesson.signs.length} signe{lesson.signs.length > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5 text-amber-400/70">
                <Star className="w-4 h-4" />
                {lesson.xpReward} XP
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bouton quiz */}
        {lesson.signs.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              href={`/quiz/${lesson.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:scale-[1.02] transition-transform"
            >
              Commencer le quiz →
            </Link>
          </motion.div>
        )}

        {/* Grille des signes */}
        {lesson.signs.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
          >
            {lesson.signs.map((sign) => (
              <motion.div
                key={sign.id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.3 }}
              >
                <LessonSignCard sign={sign} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-white/30 text-sm">Aucun signe dans cette leçon pour l&apos;instant.</p>
        )}

      </div>
    </div>
  );
}

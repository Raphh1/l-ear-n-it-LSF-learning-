'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Star, CheckCircle2, HandMetal, MessageSquareText } from 'lucide-react';
import { modulesApi } from '@/lib/api/modules';
import { progressApi } from '@/lib/api/progress';
import { useAuthStore } from '@/store/authStore';
import type { ModuleDetail } from '@/lib/types';

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModule = modulesApi.getById(Number(id));
    const fetchProgress = user ? progressApi.getMe().catch(() => null) : Promise.resolve(null);

    Promise.all([fetchModule, fetchProgress])
      .then(([mod, progress]) => {
        setModule(mod);
        if (progress) setCompletedIds(new Set(progress.completedLessonIds));
      })
      .catch(() => router.push('/modules'))
      .finally(() => setIsLoading(false));
  }, [id, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] px-6 py-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <div className="h-8 w-40 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-12 w-64 rounded-lg bg-white/5 animate-pulse" />
          <div className="flex flex-col gap-3 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!module) return null;

  return (
    <div className="min-h-screen bg-[#0a0a1a] px-6 py-16">
      <div className="max-w-3xl mx-auto flex flex-col gap-10">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6">
          <Link href="/modules" className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" />
            Retour aux modules
          </Link>

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-white">{module.title}</h1>
            {module.description && <p className="text-white/40">{module.description}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-white/30">
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{module.lessonCount} leçon{module.lessonCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
        >
          {module.lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.3 }}
            >
              <Link href={lesson.lessonType === 'phrases' ? `/lecon-phrases/${lesson.id}` : `/lessons/${lesson.id}`}>
                <div className={`flex items-center gap-5 rounded-2xl border px-6 py-5 hover:bg-white/8 hover:border-white/20 transition-all duration-200 group ${completedIds.has(lesson.id) ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}>
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl border font-bold text-sm shrink-0 transition-colors ${
                    completedIds.has(lesson.id)
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : lesson.lessonType === 'phrases'
                      ? 'bg-white/5 border-white/10 text-white/40 group-hover:border-teal-500/40 group-hover:text-teal-400'
                      : 'bg-white/5 border-white/10 text-white/40 group-hover:border-violet-500/40 group-hover:text-violet-400'
                  }`}>
                    {completedIds.has(lesson.id)
                      ? <CheckCircle2 className="w-5 h-5" />
                      : index + 1}
                  </div>

                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{lesson.title}</span>
                      {lesson.lessonType === 'phrases' && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium">
                          <MessageSquareText className="w-3 h-3" />
                          Phrases
                        </span>
                      )}
                    </div>
                    {lesson.description && (
                      <span className="text-white/30 text-xs truncate">{lesson.description}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs text-white/30">
                    {lesson.lessonType === 'phrases' ? (
                      <span className="flex items-center gap-1">
                        <MessageSquareText className="w-3 h-3" />
                        {lesson.phraseCount} phrase{lesson.phraseCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <HandMetal className="w-3 h-3" />
                        {lesson.signCount} signe{lesson.signCount > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-amber-400/70">
                      <Star className="w-3 h-3" />{lesson.xpReward} XP
                    </span>
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

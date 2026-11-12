'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Star, Check, HandMetal, MessageSquareText, ArrowRight } from 'lucide-react';
import { modulesApi } from '@/lib/api/modules';
import { progressApi } from '@/lib/api/progress';
import { useAuthStore } from '@/store/authStore';
import { BackLink } from '@/components/brand/BackLink';
import { LevelMeter } from '@/components/brand/LevelMeter';
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
      <div className="px-6 py-14">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-14 w-80" />
          <div className="mt-4 flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!module) return null;

  const doneCount = module.lessons.filter(l => completedIds.has(l.id)).length;
  const progressPct = module.lessons.length ? Math.round((doneCount / module.lessons.length) * 100) : 0;

  return (
    <div className="px-6 py-14">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <div className="flex flex-col gap-6">
          <BackLink href="/modules">Retour aux modules</BackLink>

          <div className="flex flex-col gap-4">
            <h1 className="page-title">{module.title}</h1>
            {module.description && <p className="text-lg text-ink/80">{module.description}</p>}
            <div className="flex flex-wrap items-center gap-4">
              <span className="sticker bg-white text-sm">
                <BookOpen className="h-4 w-4" /> {module.lessonCount} leçon{module.lessonCount > 1 ? 's' : ''}
              </span>
              <LevelMeter level={module.level} />
            </div>
          </div>

          {user && module.lessons.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-bold">
                <span>Ta progression</span>
                <span>{doneCount}/{module.lessons.length}</span>
              </div>
              <div className="bar h-5"><span className="bg-mint" style={{ width: `${progressPct}%` }} /></div>
            </div>
          )}
        </div>

        <ol className="flex flex-col gap-4">
          {module.lessons.map((lesson, index) => {
            const done = completedIds.has(lesson.id);
            const isPhrases = lesson.lessonType === 'phrases';
            return (
              <li key={lesson.id}>
                <Link
                  href={isPhrases ? `/lecon-phrases/${lesson.id}` : `/lessons/${lesson.id}`}
                  className={`panel press group flex items-center gap-4 px-4 py-4 sm:gap-5 sm:px-5 ${done ? 'bg-mint' : ''}`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-ink font-display text-xl font-extrabold ${
                    done ? 'bg-white' : isPhrases ? 'bg-ocean text-white' : 'bg-sun'
                  }`}>
                    {done ? <Check className="h-6 w-6" strokeWidth={3} /> : index + 1}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-xl font-extrabold leading-tight">{lesson.title}</span>
                      {isPhrases && (
                        <span className="sticker bg-ocean text-white"><MessageSquareText className="h-3 w-3" /> Phrases</span>
                      )}
                    </div>
                    {lesson.description && <span className="truncate text-ink/75">{lesson.description}</span>}
                  </div>

                  <div className="hidden shrink-0 flex-col items-end gap-1 text-sm font-bold sm:flex">
                    {isPhrases ? (
                      <span className="flex items-center gap-1">
                        <MessageSquareText className="h-4 w-4" /> {lesson.phraseCount} phrase{lesson.phraseCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <HandMetal className="h-4 w-4" /> {lesson.signCount} signe{lesson.signCount > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-sun" /> {lesson.xpReward} XP</span>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

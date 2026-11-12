'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, HandMetal, Star } from 'lucide-react';
import { lessonsApi } from '@/lib/api/lessons';
import { LessonSignCard } from '@/components/signs/LessonSignCard';
import { BackLink } from '@/components/brand/BackLink';
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
      <div className="px-6 py-14">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-14 w-80" />
          <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-square" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="px-6 py-14">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-6">
          <BackLink href={`/modules/${lesson.moduleId}`}>Retour au module</BackLink>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-4">
              <h1 className="page-title">{lesson.title}</h1>
              {lesson.description && <p className="max-w-xl text-lg text-ink/80">{lesson.description}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <span className="sticker bg-white text-sm">
                  <HandMetal className="h-4 w-4" /> {lesson.signs.length} signe{lesson.signs.length > 1 ? 's' : ''}
                </span>
                <span className="sticker bg-sun text-sm"><Star className="h-4 w-4" /> {lesson.xpReward} XP</span>
              </div>
            </div>

            {lesson.signs.length >= 2 && (
              <Link href={`/quiz/${lesson.id}`} className="btn btn-tomato btn-lg">
                Commencer le quiz <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        {lesson.signs.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {lesson.signs.map((sign) => <LessonSignCard key={sign.id} sign={sign} />)}
          </div>
        ) : (
          <p className="panel p-8 text-center font-bold">Aucun signe dans cette leçon pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}

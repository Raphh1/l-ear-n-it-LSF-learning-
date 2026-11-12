'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { signsApi } from '@/lib/api/signs';
import { modulesApi } from '@/lib/api/modules';
import { categoriesApi } from '@/lib/api/categories';
import { dailyApi, type DailyChallenge } from '@/lib/api/daily';
import { useAuthStore } from '@/store/authStore';
import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { DailyChallenge as DailyChallengeSection } from '@/components/home/DailyChallenge';
import { DailyModules } from '@/components/home/DailyModules';
import { ExploreSection } from '@/components/home/ExploreSection';

export default function HomePage() {
  const activitiesRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const [signCount, setSignCount] = useState<number | null>(null);
  const [moduleCount, setModuleCount] = useState<number | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isDailyLoading, setIsDailyLoading] = useState(true);
  const [modules, setModules] = useState<import('@/lib/types').Module[]>([]);
  const [isModulesLoading, setIsModulesLoading] = useState(true);

  useEffect(() => {
    signsApi.getAll({ page: 1, pageSize: 1 }).then(r => setSignCount(r.totalCount));
    modulesApi.getAll().then(m => { setModules(m); setModuleCount(m.length); }).finally(() => setIsModulesLoading(false));
    categoriesApi.getAll().then(c => setCategoryCount(c.length));
    dailyApi.getToday()
      .then(setDailyChallenge)
      .catch(() => {})
      .finally(() => setIsDailyLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      <HeroSection
        signCount={signCount}
        moduleCount={moduleCount}
        categoryCount={categoryCount}
        onScrollDown={() => activitiesRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      <div ref={activitiesRef}>
        <HowItWorksSection />
      </div>

      <DailyChallengeSection
        dailyChallenge={dailyChallenge}
        isLoading={isDailyLoading}
        user={user}
      />

      <DailyModules modules={modules} isLoading={isModulesLoading} />

      <ExploreSection />

      <section className="border-t-[3px] border-ink bg-ocean px-6 py-20 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="max-w-xl text-5xl font-extrabold leading-none sm:text-6xl">
            Ton premier signe, c&apos;est maintenant.
          </h2>
          <Link href="/modules" className="btn btn-sun btn-lg">
            C&apos;est parti <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t-[3px] border-ink bg-ink px-6 py-8 text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span className="font-display text-lg font-extrabold">L&apos;ear&apos;n it</span>
          <span className="text-paper/80">Vidéos de signes : Elix, dictionnaire vivant en LSF.</span>
        </div>
      </footer>
    </div>
  );
}

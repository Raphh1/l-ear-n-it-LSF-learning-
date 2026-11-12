'use client';

import { useEffect, useState } from 'react';
import { modulesApi } from '@/lib/api/modules';
import { ModuleCard } from '@/components/modules/ModuleCard';
import { PageHeader } from '@/components/brand/PageHeader';
import type { Module } from '@/lib/types';

export default function QuizIndexPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    modulesApi.getAll()
      .then(setModules)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <PageHeader kicker="Jouer" kickerClass="bg-tomato" title="Quiz">
          Choisis un module, sélectionne une leçon et teste tes connaissances.
        </PageHeader>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-52" />)}
          </div>
        ) : modules.length === 0 ? (
          <p className="panel py-20 text-center font-bold">Aucun module disponible pour l&apos;instant.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => <ModuleCard key={module.id} module={module} />)}
          </div>
        )}
      </div>
    </div>
  );
}

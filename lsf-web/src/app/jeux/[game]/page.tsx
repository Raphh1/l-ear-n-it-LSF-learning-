'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Lock, Target, Zap, RefreshCw, Brain, Hourglass, MessageCircle, Gamepad2, BookOpen, Play, type LucideIcon } from 'lucide-react';
import { modulesApi } from '@/lib/api/modules';
import { BackLink } from '@/components/brand/BackLink';
import { LevelMeter } from '@/components/brand/LevelMeter';
import type { Module, LessonSummary, ModuleDetail } from '@/lib/types';

const GAME_LABELS: Record<string, { title: string; icon: LucideIcon; color: string }> = {
  quiz:         { title: 'Quiz',                    icon: Target,        color: 'bg-tomato' },
  vitesse:      { title: 'Vitesse',                 icon: Zap,           color: 'bg-tomato' },
  inverse:      { title: 'Mode inversé',            icon: RefreshCw,     color: 'bg-tomato' },
  memoire:      { title: 'Mémoire',                 icon: Brain,         color: 'bg-tomato' },
  survie:       { title: 'Survie',                  icon: Hourglass,     color: 'bg-tomato' },
  revision:     { title: 'Révision',                icon: BookOpen,      color: 'bg-mint' },
  constructeur: { title: 'Constructeur de phrases', icon: MessageCircle, color: 'bg-ocean text-white' },
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

  const isPhraseGame = game === 'constructeur';

  function renderLessons() {
    if (isLoadingLessons) {
      return Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14" />);
    }
    if (!lessons || lessons.length === 0) {
      return <p className="py-2 font-bold">Aucune leçon disponible.</p>;
    }

    const filtered = lessons
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((l) => isPhraseGame ? l.lessonType === 'phrases' : l.lessonType !== 'phrases');

    if (filtered.length === 0) {
      return (
        <p className="py-2 font-bold">
          {isPhraseGame ? 'Aucune leçon de phrases dans ce module.' : 'Aucune leçon disponible.'}
        </p>
      );
    }

    return filtered.map((lesson) => {
      const disabled = isPhraseGame ? lesson.phraseCount < 1 : lesson.signCount < 2;
      const countLabel = isPhraseGame
        ? `${lesson.phraseCount} phrase${lesson.phraseCount !== 1 ? 's' : ''}`
        : `${lesson.signCount} signe${lesson.signCount !== 1 ? 's' : ''}`;

      return (
        <div key={lesson.id} className="flex items-center justify-between gap-3 border-2 border-ink bg-paper px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-bold">{lesson.title}</span>
            <span className="text-sm text-ink/75">{countLabel} · {lesson.xpReward} XP</span>
          </div>
          {disabled ? (
            <span className="btn btn-sm shrink-0 cursor-not-allowed opacity-50 shadow-none" aria-disabled="true">
              <Lock className="h-4 w-4" /> Jouer
            </span>
          ) : (
            <Link href={`/jeux/${game}/${lesson.id}`} className={`btn btn-sm shrink-0 ${isPhraseGame ? 'btn-ocean' : 'btn-ink'}`}>
              <Play className="h-4 w-4 fill-current" /> Jouer
            </Link>
          )}
        </div>
      );
    });
  }

  return (
    <div className={`panel overflow-hidden ${isOpen ? 'shadow-hard-lg' : ''}`}>
      <button
        onClick={handleToggle}
        className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left ${isOpen ? 'border-b-[3px] border-ink bg-sun' : 'hover:bg-paper'}`}
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-display text-xl font-extrabold">{module.title}</span>
          <span className="flex items-center gap-3 text-sm">
            <LevelMeter level={module.level} />
            <span>· {module.lessonCount} leçon{module.lessonCount !== 1 ? 's' : ''}</span>
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-6 w-6 shrink-0" strokeWidth={2.5} /> : <ChevronDown className="h-6 w-6 shrink-0" strokeWidth={2.5} />}
      </button>

      {isOpen && <div className="flex flex-col gap-3 p-4">{renderLessons()}</div>}
    </div>
  );
}

export default function GameLessonSelectPage() {
  const { game } = useParams<{ game: string }>();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModuleId, setOpenModuleId] = useState<number | null>(null);

  const STANDALONE_GAMES = ['defi', 'classement'];
  const isStandalone = STANDALONE_GAMES.includes(game);
  const gameInfo = GAME_LABELS[game] ?? { title: game, icon: Gamepad2, color: 'bg-tomato' };
  const GameIcon = gameInfo.icon;

  useEffect(() => {
    if (isStandalone) {
      router.replace(`/jeux/${game}`);
      return;
    }
    modulesApi.getAll()
      .then((data) => {
        setModules(data);
        if (data.length > 0) setOpenModuleId(data[0].id);
      })
      .finally(() => setIsLoading(false));
  }, [isStandalone, game, router]);

  if (isStandalone) return null;

  return (
    <div className="px-6 py-14">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <BackLink href="/jeux">Jeux</BackLink>
          <div className="flex items-center gap-4">
            <span className={`flex h-16 w-16 shrink-0 -rotate-3 items-center justify-center border-[3px] border-ink shadow-hard ${gameInfo.color}`}>
              <GameIcon className="h-8 w-8" strokeWidth={2.5} />
            </span>
            <div>
              <h1 className="page-title">{gameInfo.title}</h1>
              <p className="mt-2 text-lg font-bold">Choisis une leçon pour commencer</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20" />)}
          </div>
        ) : modules.length === 0 ? (
          <p className="panel py-20 text-center font-bold">Aucun module disponible.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {modules
              .slice()
              .filter((m) => game === 'constructeur' ? m.hasPhraseLessons : !m.hasPhraseLessons)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((module) => (
                <AccordionItem
                  key={module.id}
                  module={module}
                  game={game}
                  isOpen={openModuleId === module.id}
                  onToggle={() => setOpenModuleId(openModuleId === module.id ? null : module.id)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

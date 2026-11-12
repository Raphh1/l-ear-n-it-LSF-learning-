'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import { progressApi, type ProgressResponse } from '@/lib/api/progress';
import { modulesApi } from '@/lib/api/modules';
import { badgesApi, type BadgeDto } from '@/lib/api/badges';
import { revisionApi } from '@/lib/api/revision';
import { questsApi } from '@/lib/api/quests';
import { historyApi } from '@/lib/api/history';
import { getLevelFromXp, type ModuleProgress } from '@/lib/profile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileXpBar } from '@/components/profile/ProfileXpBar';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { BadgesGrid } from '@/components/profile/BadgesGrid';
import { ModuleProgressList } from '@/components/profile/ModuleProgressList';
import { ProfileGlobalStats } from '@/components/profile/ProfileGlobalStats';
import { DailyQuestsWidget } from '@/components/profile/DailyQuestsWidget';
import { GameHistoryList } from '@/components/profile/GameHistoryList';
import type { Module, GlobalStats, DailyQuest, GameSession } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const { favoriteIds } = useFavoriteStore();

  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [badges, setBadges] = useState<BadgeDto[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [quests, setQuests] = useState<DailyQuest[] | null>(null);
  const [history, setHistory] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) { router.push('/login'); return; }

      try {
        setIsLoading(true);
        const [prog, mods, userBadges, gStats, dailyQuests, gameHistory] = await Promise.all([
          progressApi.getMe(),
          modulesApi.getAll(),
          badgesApi.getMyBadges().catch(() => [] as BadgeDto[]),
          revisionApi.getGlobalStats(),
          questsApi.getToday(),
          historyApi.getHistory(),
        ]);
        if (cancelled) return;

        setBadges(userBadges);
        setGlobalStats(gStats);
        setQuests(dailyQuests);
        setHistory(gameHistory);
        setProgress(prog);
        setModules(mods);

        const completedIds = new Set(prog.completedLessonIds ?? []);
        const details = await Promise.allSettled(mods.map((m) => modulesApi.getById(m.id)));
        if (cancelled) return;

        setModuleProgress(mods.map((mod, i) => {
          const r = details[i];
          if (r.status === 'fulfilled') {
            const total = r.value.lessons.length;
            const done = r.value.lessons.filter((l) => completedIds.has(l.id)).length;
            return { module: mod, completedLessons: done, totalLessons: total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
          }
          return { module: mod, completedLessons: 0, totalLessons: mod.lessonCount, percent: 0 };
        }));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user, router]);

  const handleEditOpen = () => {
    if (!user) return;
    setEditUsername(user.username);
    setEditEmail(user.email);
    setErrorMsg('');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editUsername.trim() || !editEmail.trim()) { setErrorMsg('Veuillez remplir tous les champs.'); return; }
    setIsSaving(true);
    setErrorMsg('');
    try {
      await updateProfile({ username: editUsername.trim(), email: editEmail.trim() });
      setIsEditing(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };

  const sortedModuleProgress = useMemo(
    () => [...moduleProgress].sort((a, b) => a.module.sortOrder - b.module.sortOrder),
    [moduleProgress],
  );

  if (!user) return null;

  const xpTotal = progress?.xpTotal ?? 0;
  const { level, xpInLevel, xpForNext } = getLevelFromXp(xpTotal);
  const modulesCompleted = sortedModuleProgress.filter((m) => m.percent === 100).length;
  const modulesStarted = sortedModuleProgress.filter((m) => m.completedLessons > 0).length;

  return (
    <div className="px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div className="flex justify-end gap-3">
          <Link href="/favorites" className="btn btn-sm">Mes favoris</Link>
          <Link href="/settings" className="btn btn-sm">Paramètres du compte</Link>
        </div>

        <ProfileHeader
          user={user}
          level={level}
          isEditing={isEditing}
          editUsername={editUsername}
          editEmail={editEmail}
          isSaving={isSaving}
          errorMsg={errorMsg}
          onEditOpen={handleEditOpen}
          onEditCancel={() => { setIsEditing(false); setErrorMsg(''); }}
          onSave={handleSave}
          onUsernameChange={setEditUsername}
          onEmailChange={setEditEmail}
        />

        <ProfileXpBar
          level={level}
          xpTotal={xpTotal}
          xpInLevel={xpInLevel}
          xpForNext={xpForNext}
          isLoading={isLoading}
        />

        <ProfileStats
          streakDays={progress?.streakDays ?? 0}
          lessonsCompleted={progress?.lessonsCompleted ?? 0}
          modulesCompleted={modulesCompleted}
          totalModules={modules.length}
          favoriteCount={favoriteIds.length}
          isLoading={isLoading}
        />

        <DailyQuestsWidget quests={quests} isLoading={isLoading} />

        <ProfileGlobalStats stats={globalStats} isLoading={isLoading} />

        <BadgesGrid badges={badges} />

        <ModuleProgressList
          moduleProgress={sortedModuleProgress}
          totalModules={modules.length}
          modulesStarted={modulesStarted}
          isLoading={isLoading}
        />

        <GameHistoryList sessions={history} isLoading={isLoading} />
      </div>
    </div>
  );
}

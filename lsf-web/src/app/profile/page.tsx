'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star,
  Flame,
  BookOpen,
  Edit2,
  Check,
  X,
  Heart,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import { progressApi, type ProgressResponse } from '@/lib/api/progress';
import { modulesApi } from '@/lib/api/modules';
import { badgesApi, type BadgeDto } from '@/lib/api/badges';
import type { Module } from '@/lib/types';

interface ModuleProgress {
  module: Module;
  completedLessons: number;
  totalLessons: number;
  percent: number;
}

function getLevelFromXp(xp: number) {
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const xpForNext = 100;
  return { level, xpInLevel, xpForNext };
}

const levelLabels: Record<number, string> = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Avancé',
};

const levelColors: Record<number, string> = {
  1: 'from-emerald-500 to-teal-500',
  2: 'from-violet-500 to-indigo-600',
  3: 'from-rose-500 to-orange-400',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const { favoriteIds } = useFavoriteStore();

  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [badges, setBadges] = useState<BadgeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProfileData = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setIsLoading(true);

        const [prog, mods, userBadges] = await Promise.all([
          progressApi.getMe(),
          modulesApi.getAll(),
          badgesApi.getMyBadges().catch(() => [] as BadgeDto[]),
        ]);
        if (!cancelled) setBadges(userBadges);

        if (cancelled) return;

        setProgress(prog);
        setModules(mods);

        const completedLessonIds = new Set(prog.completedLessonIds ?? []);
        const detailsResults = await Promise.allSettled(mods.map((mod) => modulesApi.getById(mod.id)));

        if (cancelled) return;

        const perModuleProgress: ModuleProgress[] = mods.map((mod, index) => {
          const result = detailsResults[index];

          if (result.status === 'fulfilled') {
            const totalLessons = result.value.lessons.length;
            const completedLessons = result.value.lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
            const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

            return {
              module: mod,
              completedLessons,
              totalLessons,
              percent,
            };
          }

          return {
            module: mod,
            completedLessons: 0,
            totalLessons: mod.lessonCount,
            percent: 0,
          };
        });

        setModuleProgress(perModuleProgress);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadProfileData();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  const handleEditOpen = () => {
    if (!user) return;

    setEditUsername(user.username);
    setEditEmail(user.email);
    setErrorMsg('');
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setErrorMsg('');
  };

  const handleSave = async () => {
    if (!editUsername.trim() || !editEmail.trim()) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }

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
  const streakDays = progress?.streakDays ?? 0;
  const lessonsCompleted = progress?.lessonsCompleted ?? 0;
  const { level, xpInLevel, xpForNext } = getLevelFromXp(xpTotal);

  const modulesStarted = sortedModuleProgress.filter((item) => item.completedLessons > 0).length;
  const modulesCompleted = sortedModuleProgress.filter((item) => item.percent === 100).length;

  const stats = [
    {
      icon: Flame,
      label: 'Série en cours',
      value: isLoading ? '—' : `${streakDays} jour${streakDays > 1 ? 's' : ''}`,
      color: 'text-orange-400',
      bg: 'border-orange-400/20 bg-orange-400/5',
    },
    {
      icon: BookOpen,
      label: 'Leçons complétées',
      value: isLoading ? '—' : String(lessonsCompleted),
      color: 'text-violet-400',
      bg: 'border-violet-400/20 bg-violet-400/5',
    },
    {
      icon: Trophy,
      label: 'Modules terminés',
      value: isLoading ? '—' : `${modulesCompleted}/${modules.length}`,
      color: 'text-emerald-400',
      bg: 'border-emerald-400/20 bg-emerald-400/5',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[130px]" />

      <div className="relative max-w-3xl mx-auto flex flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-7"
        >
          <div className="relative shrink-0">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-black text-3xl shadow-lg shadow-violet-900/40">
              {user.username[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center w-7 h-7 rounded-full bg-violet-600 border-2 border-[#0a0a1a] text-white text-xs font-bold">
              {level}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {!isEditing ? (
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                  <p className="text-white/40 text-sm">{user.email}</p>
                  <p className="text-white/30 text-xs mt-1">
                    Membre depuis{' '}
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={handleEditOpen}
                  className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0"
                  title="Modifier mon profil"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/40 px-1">Nom d&apos;utilisateur</label>
                    <input
                      type="text"
                      className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/40 px-1">Email</label>
                    <input
                      type="email"
                      className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {errorMsg && <p className="text-red-400 text-xs px-1">{errorMsg}</p>}

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={handleEditCancel}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="flex flex-col gap-4 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-7"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-white/40 text-xs uppercase tracking-widest">Niveau {level}</span>
              <span className="text-white font-bold text-xl">
                {isLoading ? '—' : levelLabels[level <= 3 ? level : 3]}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-amber-400 font-bold text-sm">{isLoading ? '—' : xpTotal} XP</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: isLoading ? '0%' : `${(xpInLevel / xpForNext) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/30">
              <span>{xpInLevel} XP</span>
              <span>{xpForNext} XP pour le niveau {level + 1}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4"
        >
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`flex flex-col gap-3 rounded-2xl border p-5 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
              <div className="flex flex-col gap-0.5">
                <span className={`text-2xl font-bold ${color}`}>{value}</span>
                <span className="text-white/40 text-xs">{label}</span>
              </div>
            </div>
          ))}

          <Link href="/favorites">
            <div className="flex flex-col h-full gap-3 rounded-2xl border p-5 border-rose-400/20 bg-rose-400/5 hover:bg-rose-400/10 hover:border-rose-400/40 transition-all cursor-pointer group">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400/20 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col gap-0.5 mt-auto">
                <span className="text-2xl font-bold text-rose-400">{favoriteIds.length}</span>
                <span className="text-white/40 text-xs">Mes favoris</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ─── Badges ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">Badges</h2>
            <span className="text-white/40 text-xs">
              {badges.filter((b) => b.earned).length}/{badges.length} obtenus
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.slug}
                title={badge.description}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                  badge.earned
                    ? 'border-amber-400/25 bg-amber-400/8'
                    : 'border-white/8 bg-white/3 opacity-40 grayscale'
                }`}
              >
                <span className="text-3xl">{badge.icon}</span>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-semibold ${badge.earned ? 'text-amber-200' : 'text-white/40'}`}>
                    {badge.title}
                  </span>
                  {badge.earned && badge.earnedAt && (
                    <span className="text-white/25 text-[10px]">
                      {new Date(badge.earnedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.27 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">Progression par module</h2>
            <span className="text-white/40 text-xs">
              {isLoading ? '—' : `${modulesStarted}/${modules.length} commencé${modulesStarted > 1 ? 's' : ''}`}
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : modules.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/30 text-sm">
              Aucun module disponible.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedModuleProgress.map((item) => {
                const gradient = levelColors[item.module.level] ?? levelColors[1];
                const label = levelLabels[item.module.level] ?? 'Débutant';

                return (
                  <Link key={item.module.id} href={`/modules/${item.module.id}`}>
                    <div className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/7 p-4 transition-all duration-200 cursor-pointer">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} text-white font-bold text-sm shrink-0`}>
                        {item.module.level}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-white text-sm font-medium truncate">{item.module.title}</span>
                          <span className="text-white/30 text-xs shrink-0">{label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <span className="text-white/40 text-xs shrink-0">
                            {item.completedLessons}/{item.totalLessons}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {item.percent === 100 && (
                          <span className="text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-400/25 rounded-full px-2 py-0.5">
                            Terminé
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

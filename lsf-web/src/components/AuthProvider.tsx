'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { useFavoriteStore } from '@/store/favoriteStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const fetchProgress = useProgressStore((s) => s.fetch);
  const hydrateFavorites = useFavoriteStore((s) => s.hydrate);

  useEffect(() => {
    hydrate().then(() => {
      // Le token vit dans un cookie httpOnly (illisible en JS) : on se fie au résultat de /me
      if (useAuthStore.getState().user) {
        fetchProgress();
        hydrateFavorites();
      }
    });
  }, [hydrate, fetchProgress, hydrateFavorites]);

  return <>{children}</>;
}

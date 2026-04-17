import { create } from 'zustand';
import { favoritesApi } from '@/lib/api/favorites';

interface FavoriteState {
  favoriteIds: string[];
  isLoading: boolean;
  hydrate: () => Promise<void>;
  toggleFavorite: (signId: string) => Promise<void>;
  isFavorite: (signId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favoriteIds: [],
  isLoading: false,

  hydrate: async () => {
    try {
      const ids = await favoritesApi.getIds();
      set({ favoriteIds: ids });
    } catch {
      // Ignorer si non connecté
    }
  },

  toggleFavorite: async (signId: string) => {
    const { favoriteIds } = get();
    const isFav = favoriteIds.includes(signId);

    // Optimistic update
    set({
      favoriteIds: isFav
        ? favoriteIds.filter((id) => id !== signId)
        : [...favoriteIds, signId],
    });

    try {
      if (isFav) {
        await favoritesApi.remove(signId);
      } else {
        await favoritesApi.add(signId);
      }
    } catch (error) {
      // Rollback en cas d'erreur
      set({ favoriteIds });
      console.error('Erreur lors de la modification des favoris', error);
    }
  },

  isFavorite: (signId: string) => {
    return get().favoriteIds.includes(signId);
  },
}));

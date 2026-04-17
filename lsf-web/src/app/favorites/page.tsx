'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { useAuthStore } from '@/store/authStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import type { SignSummary } from '@/lib/types';
import { SignCard } from '@/components/signs/SignCard';

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { favoriteIds } = useFavoriteStore();
  
  const [favoriteSigns, setFavoriteSigns] = useState<SignSummary[]>([]);
  const [compatibilityMode, setCompatibilityMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const { favoritesApi } = await import('@/lib/api/favorites');
        const result = await favoritesApi.getAll();
        setFavoriteSigns(result.items);
        setCompatibilityMode(result.compatibilityMode);
      } catch (error) {
        console.error('Failed to fetch favorite signs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user, router]); // deliberately not including favoriteIds in dependency array so it doesn't refetch on every toggle

  useEffect(() => {
    // Keep favorites updated when favoriteIds change
    if (!isLoading) {
      setFavoriteSigns(prev => prev.filter(s => favoriteIds.includes(s.id)));
    }
  }, [favoriteIds, isLoading]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 mb-4">
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au profil
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
              Mes Favoris
            </h1>
            <div className="flex items-center gap-2">
              {compatibilityMode && (
                <div className="bg-amber-500/10 border border-amber-400/20 px-3 py-1.5 rounded-xl text-amber-300/90 text-xs font-medium">
                  Mode compatibilité API
                </div>
              )}
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-white/70 font-medium">
                {favoriteIds.length} signe{favoriteIds.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <p className="text-white/60 text-lg">
            Retrouvez ici tous les signes que vous avez mis en favoris pour les réviser plus facilement.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/50">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <p>Chargement de vos favoris...</p>
          </div>
        ) : favoriteSigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteSigns.map((sign, index) => (
              <motion.div
                key={sign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <SignCard sign={sign} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.02] border border-white/5 rounded-3xl"
          >
            <Heart className="w-16 h-16 text-white/10 mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Aucun favori pour le moment</h2>
            <p className="text-white/50 max-w-md mb-8">
              Explorez le dictionnaire ou les leçons et cliquez sur le cœur pour ajouter des signes à votre collection de favoris.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="/dictionnaire" 
                className="bg-rose-500 hover:bg-rose-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20"
              >
                Explorer le dictionnaire
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import Link from 'next/link';

import { useAuthStore } from '@/store/authStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import type { SignSummary } from '@/lib/types';
import { SignCard } from '@/components/signs/SignCard';
import { BackLink } from '@/components/brand/BackLink';
import { PageHeader } from '@/components/brand/PageHeader';
import { Loader } from '@/components/brand/Loader';

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
  }, [user, router]); // volontairement sans favoriteIds pour ne pas refetch à chaque clic

  useEffect(() => {
    // Retire de l'affichage les signes retirés des favoris
    if (!isLoading) {
      setFavoriteSigns(prev => prev.filter(s => favoriteIds.includes(s.id)));
    }
  }, [favoriteIds, isLoading]);

  if (!user) return null;

  return (
    <div className="px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <BackLink href="/profile">Retour au profil</BackLink>

        <PageHeader
          kicker="Ma collection"
          kickerClass="bg-tomato"
          title="Mes favoris"
          actions={
            <>
              {compatibilityMode && <span className="sticker bg-sun">Mode compatibilité API</span>}
              <span className="tile bg-white text-lg">
                <Heart className="mr-2 h-5 w-5 fill-tomato" /> {favoriteIds.length} signe{favoriteIds.length !== 1 ? 's' : ''}
              </span>
            </>
          }
        >
          Tous les signes que tu as mis de côté pour les réviser plus facilement.
        </PageHeader>

        {isLoading ? (
          <Loader label="Chargement de tes favoris..." />
        ) : favoriteSigns.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {favoriteSigns.map((sign) => <SignCard key={sign.id} sign={sign} />)}
          </div>
        ) : (
          <div className="panel flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <span className="flex h-20 w-20 -rotate-6 items-center justify-center border-[3px] border-ink bg-tomato shadow-hard">
              <Heart className="h-10 w-10" strokeWidth={2.5} />
            </span>
            <h2 className="text-3xl font-extrabold">Aucun favori pour le moment</h2>
            <p className="max-w-md text-lg text-ink/80">
              Explore le dictionnaire ou les leçons et clique sur le cœur pour ajouter des signes à ta collection.
            </p>
            <Link href="/dictionnaire" className="btn btn-ink btn-lg mt-2">Explorer le dictionnaire</Link>
          </div>
        )}
      </div>
    </div>
  );
}

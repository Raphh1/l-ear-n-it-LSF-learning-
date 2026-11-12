'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Tag, Brain, Calendar, Hand } from 'lucide-react';
import { signsApi } from '@/lib/api/signs';
import { revisionApi } from '@/lib/api/revision';
import { useAuthStore } from '@/store/authStore';
import { BackLink } from '@/components/brand/BackLink';
import { LevelMeter } from '@/components/brand/LevelMeter';
import { VariantPicker, type PlayableVideo } from '@/components/signs/VariantPicker';
import { OtherMeanings, toPlayable } from '@/components/signs/OtherMeanings';
import type { SignDetail, SignStat } from '@/lib/types';

// Vidéos du sens principal, la vidéo utilisée dans les leçons en premier
function mainVideos(sign: SignDetail): PlayableVideo[] {
  const primary = sign.meanings.find((m) => m.isPrimary);
  if (!primary) {
    return sign.videoUrl ? [{ url: sign.videoUrl, thumbnailUrl: sign.thumbnailUrl, author: null, kind: 'sign' }] : [];
  }
  const videos = toPlayable(primary);
  return [...videos.filter((v) => v.url === sign.videoUrl), ...videos.filter((v) => v.url !== sign.videoUrl)];
}

export default function SignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [sign, setSign] = useState<SignDetail | null>(null);
  const [stat, setStat] = useState<SignStat | null>(null);
  const [selected, setSelected] = useState<PlayableVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    signsApi.getBySlug(slug)
      .then((data) => {
        setSign(data);
        setSelected(mainVideos(data)[0] ?? null);
        if (user) revisionApi.getSignStat(data.id).then(setStat);
      })
      .catch(() => router.push('/dictionnaire'))
      .finally(() => setIsLoading(false));
  }, [slug, router, user]);

  const videos = sign ? mainVideos(sign) : [];
  const variantCount = videos.filter((v) => v.kind === 'sign').length;
  const videoSrc = selected?.url ?? null;

  if (isLoading) {
    return (
      <div className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="skeleton aspect-video" />
          <div className="flex flex-col gap-4">
            <div className="skeleton h-14 w-56" />
            <div className="skeleton h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!sign) return null;

  const primary = sign.meanings.find((m) => m.isPrimary);
  const otherMeanings = sign.meanings.filter((m) => !m.isPrimary);
  const definition = primary?.definition ?? sign.definition;
  const total = stat ? stat.correctCount + stat.wrongCount : 0;

  return (
    <div className="px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <BackLink href="/dictionnaire">Retour au dictionnaire</BackLink>

        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Vidéo */}
          <div className="flex flex-col gap-3">
            <div className="panel overflow-hidden p-2 shadow-hard-lg">
              <div className="border-[3px] border-ink bg-white">
                {videoSrc ? (
                  <video key={videoSrc} src={videoSrc} controls autoPlay loop muted playsInline className="w-full" />
                ) : sign.gifUrl ? (
                  <div className="relative aspect-video">
                    <Image src={sign.gifUrl} alt={sign.word} fill className="object-contain" unoptimized />
                  </div>
                ) : sign.thumbnailUrl ? (
                  <div className="relative aspect-video">
                    <Image src={sign.thumbnailUrl} alt={sign.word} fill className="object-contain" />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-paper">
                    <Hand className="h-24 w-24 text-ink/25" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">
                {selected?.kind === 'definition'
                  ? 'Définition signée en LSF'
                  : variantCount > 1 ? `${variantCount} façons de signer ce mot` : 'Le signe'}
              </span>
              {selected?.author && <span className="text-sm text-ink/70">Source : {selected.author}</span>}
            </div>

            {videos.length > 1 && (
              <VariantPicker videos={videos} selectedUrl={videoSrc} onSelect={setSelected} />
            )}

            {variantCount > 1 && (
              <p className="text-sm text-ink/75">
                Les variantes viennent souvent de régions ou d&apos;usages différents : toutes sont correctes.
                La première est celle utilisée dans les leçons.
              </p>
            )}
          </div>

          {/* Infos */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="break-words font-display text-6xl font-extrabold capitalize leading-none sm:text-7xl">{sign.word}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="sticker bg-mint text-sm">{sign.categoryName}</span>
                <LevelMeter level={sign.difficulty || 1} />
              </div>
            </div>

            {definition && (
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-bold uppercase tracking-widest">Définition</h2>
                <p className="text-lg leading-relaxed">{definition}</p>
              </div>
            )}

            {sign.tags.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                  <Tag className="h-4 w-4" /> Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {sign.tags.map((tag) => <span key={tag} className="sticker bg-white">{tag}</span>)}
                </div>
              </div>
            )}

            {user && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-bold uppercase tracking-widest">Mes stats</h2>
                {stat ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: stat.correctCount, label: 'Correct', color: 'bg-mint' },
                        { value: stat.wrongCount, label: 'Erreurs', color: 'bg-tomato' },
                        { value: total === 0 ? '—' : `${Math.round((stat.correctCount / total) * 100)}%`, label: 'Réussite', color: 'bg-sun' },
                      ].map(s => (
                        <div key={s.label} className={`panel-flat flex flex-col items-center gap-1 py-4 ${s.color}`}>
                          <span className="font-display text-3xl font-extrabold">{s.value}</span>
                          <span className="text-sm font-bold">{s.label}</span>
                        </div>
                      ))}
                    </div>

                    {stat.nextReviewAt && (
                      <div className="panel-flat flex items-center gap-4 px-4 py-3">
                        <Brain className="h-6 w-6 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm">Prochaine révision</p>
                          <p className="font-bold">
                            {new Date(stat.nextReviewAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Intervalle</p>
                          <p className="font-bold">{stat.srsInterval} j</p>
                        </div>
                      </div>
                    )}

                    {stat.lastAttemptAt && (
                      <p className="flex items-center gap-1 text-sm text-ink/75">
                        <Calendar className="h-4 w-4" />
                        Dernière pratique : {new Date(stat.lastAttemptAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="panel-flat bg-paper p-4">Jamais pratiqué. Joue un jeu avec ce signe pour voir tes stats.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <OtherMeanings word={sign.word} meanings={otherMeanings} hasPrimary={!!primary} />
      </div>
    </div>
  );
}

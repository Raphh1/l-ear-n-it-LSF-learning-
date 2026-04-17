'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { signsApi } from '@/lib/api/signs';
import type { ElixWordResult, SignDetail } from '@/lib/types';

const difficultyColor: Record<number, string> = {
  1: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  2: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  3: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

const difficultyLabel: Record<number, string> = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Avancé',
};

export default function SignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [sign, setSign] = useState<SignDetail | null>(null);
  const [elix, setElix] = useState<ElixWordResult | null>(null);
  const [videoIndex, setVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    signsApi.getBySlug(slug)
      .then((data) => {
        setSign(data);
        // Charger les vidéos Elix en parallèle
        signsApi.getElixVideos(data.word).then(setElix).catch(() => null);
      })
      .catch(() => router.push('/dictionnaire'))
      .finally(() => setIsLoading(false));
  }, [slug, router]);

  const videos = elix?.videos ?? [];
  const hasMultipleVideos = videos.length > 1;
  const currentVideo = videos[videoIndex];

  // Source vidéo : priorité à Elix, fallback sur la DB
  const videoSrc = currentVideo?.uri ?? sign?.videoUrl ?? null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] px-6 py-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          <div className="h-5 w-36 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-10 w-56 rounded-lg bg-white/5 animate-pulse" />
          <div className="aspect-video rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-4 w-full rounded-lg bg-white/5 animate-pulse" />
          <div className="h-4 w-2/3 rounded-lg bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!sign) return null;

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] px-6 py-16 overflow-hidden">
      {/* Blobs de fond */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative max-w-3xl mx-auto flex flex-col gap-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <Link
            href="/dictionnaire"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour au dictionnaire
          </Link>

          <div className="flex flex-col gap-3">
            <h1 className="text-5xl font-bold text-white">{sign.word}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/50">
                {sign.categoryName}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColor[sign.difficulty] ?? 'text-white/40 bg-white/5 border-white/10'}`}>
                {difficultyLabel[sign.difficulty] ?? 'Inconnu'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-3"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            {videoSrc ? (
              <video
                key={videoSrc}
                src={videoSrc}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full"
              />
            ) : sign.gifUrl ? (
              <div className="relative aspect-video">
                <Image src={sign.gifUrl} alt={sign.word} fill className="object-contain" unoptimized />
              </div>
            ) : sign.thumbnailUrl ? (
              <div className="relative aspect-video">
                <Image src={sign.thumbnailUrl} alt={sign.word} fill className="object-contain" />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <span className="text-8xl text-white/10">🤟</span>
              </div>
            )}
          </div>

          {/* Sélecteur de variantes */}
          {hasMultipleVideos && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-white/30">
                Variante {videoIndex + 1} / {videos.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setVideoIndex((i) => Math.max(0, i - 1))}
                  disabled={videoIndex === 0}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVideoIndex((i) => Math.min(videos.length - 1, i + 1))}
                  disabled={videoIndex === videos.length - 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Source */}
          {currentVideo?.author && (
            <p className="text-xs text-white/20 text-right">Source : {currentVideo.author}</p>
          )}
        </motion.div>

        {/* Définition */}
        {(elix?.definition ?? sign.definition) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col gap-2"
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">Définition</h2>
            <p className="text-white/70 leading-relaxed">{elix?.definition ?? sign.definition}</p>
          </motion.div>
        )}

        {/* Tags */}
        {sign.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col gap-3"
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" />
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {sign.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

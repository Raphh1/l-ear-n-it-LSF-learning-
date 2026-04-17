'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { signsApi } from '@/lib/api/signs';
import type { SignInLesson } from '@/lib/types';

interface SignMediaProps {
  sign: SignInLesson;
  isPlaying?: boolean;
  onEnded?: () => void;
  loop?: boolean;
}

export function SignMedia({ sign, isPlaying = true, onEnded, loop = true }: SignMediaProps) {
  const [elixVideoSrc, setElixVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!sign.videoUrl) {
      const query = sign.word.length === 1 ? `lettre ${sign.word.toLowerCase()}` : sign.word;
      signsApi.getElixVideos(query)
        .then((res) => {
          if (res.videos.length > 0) setElixVideoSrc(res.videos[0].uri);
        })
        .catch(() => null);
    }
  }, [sign.id, sign.word, sign.videoUrl]);

  const videoSrc = sign.videoUrl ?? elixVideoSrc;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      // Small pause before playing to let it breathe if we just switched to it
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {}); // ignore autoplay errors
      }
    } else {
      video.pause();
      video.currentTime = 0; // reset
    }
  }, [isPlaying, videoSrc]);

  return (
    <div className={`relative aspect-square w-full overflow-hidden ${videoSrc ? 'bg-white' : 'bg-white/5'} ${isPlaying ? 'ring-2 ring-emerald-500' : 'opacity-70'}`}>
      {videoSrc ? (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          autoPlay={isPlaying}
          loop={loop}
          muted
          playsInline
          onEnded={onEnded}
          className="absolute inset-0 w-full h-full object-contain"
        />
      ) : sign.gifUrl ? (
        <Image src={sign.gifUrl} alt={sign.word} fill className="object-contain" unoptimized />
      ) : sign.thumbnailUrl ? (
        <Image src={sign.thumbnailUrl} alt={sign.word} fill className="object-contain p-2" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl text-white/10">🤟</span>
        </div>
      )}
    </div>
  );
}

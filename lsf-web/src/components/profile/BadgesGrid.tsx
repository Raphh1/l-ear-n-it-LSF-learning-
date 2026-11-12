'use client';

import type { BadgeDto } from '@/lib/api/badges';

interface Props {
  badges: BadgeDto[];
}

const TILTS = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1'];

export function BadgesGrid({ badges }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold">Badges</h2>
        <span className="sticker bg-white">{badges.filter((b) => b.earned).length}/{badges.length} obtenus</span>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {badges.map((badge, i) => (
          <div
            key={badge.slug}
            title={badge.description}
            className={`flex flex-col items-center gap-2 border-[3px] p-4 text-center ${
              badge.earned
                ? `border-ink bg-sun shadow-hard ${TILTS[i % TILTS.length]}`
                : 'border-dashed border-ink/40 bg-transparent text-ink/50 grayscale'
            }`}
          >
            <span className="text-4xl">{badge.icon}</span>
            <span className="font-display font-extrabold leading-tight">{badge.title}</span>
            {badge.earned && badge.earnedAt && (
              <span className="text-xs font-bold">
                {new Date(badge.earnedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

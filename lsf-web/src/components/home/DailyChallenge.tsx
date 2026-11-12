'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Lock, CalendarDays, HelpCircle } from 'lucide-react';
import type { DailyChallenge as DailyChallengeType } from '@/lib/api/daily';
import type { User } from '@/lib/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

interface Props {
  dailyChallenge: DailyChallengeType | null;
  isLoading: boolean;
  user: User | null;
}

export function DailyChallenge({ dailyChallenge, isLoading, user }: Props) {
  return (
    <section className="border-y-[3px] border-ink bg-sun px-6 py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="sticker w-fit -rotate-2">Tous les jours</span>
            <h2 className="text-4xl font-extrabold sm:text-5xl">Défi du jour</h2>
          </div>
          {dailyChallenge && (
            <span className="font-display text-lg font-bold capitalize">{formatDate(dailyChallenge.date)}</span>
          )}
        </div>

        {isLoading ? (
          <div className="skeleton h-56" />
        ) : dailyChallenge ? (
          <div className="panel flex flex-col items-stretch gap-8 p-6 shadow-hard-lg sm:flex-row sm:items-center sm:p-8">
            <div className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden border-[3px] border-ink bg-paper sm:w-52">
              {dailyChallenge.sign.thumbnailUrl ? (
                <img
                  src={dailyChallenge.sign.thumbnailUrl}
                  alt="Défi du jour"
                  className={`h-full w-full object-cover ${dailyChallenge.alreadyPlayed ? '' : 'scale-110 blur-md'}`}
                />
              ) : (
                <CalendarDays className="h-14 w-14" />
              )}
              {!dailyChallenge.alreadyPlayed && (
                <span className="absolute flex h-16 w-16 rotate-6 items-center justify-center border-[3px] border-ink bg-tomato shadow-hard">
                  <HelpCircle className="h-9 w-9" strokeWidth={2.5} />
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h3 className="text-4xl font-extrabold leading-none">
                  {dailyChallenge.alreadyPlayed ? dailyChallenge.sign.word : 'Quel est ce signe ?'}
                </h3>
                <p className="text-lg text-ink/80">
                  {dailyChallenge.alreadyPlayed
                    ? dailyChallenge.wasCorrect
                      ? 'Tu as trouvé la bonne réponse !'
                      : "Tu t'es trompé aujourd'hui."
                    : 'Un nouveau signe chaque jour. Une seule chance !'}
                </p>
              </div>

              {dailyChallenge.alreadyPlayed ? (
                dailyChallenge.wasCorrect ? (
                  <span className="sticker w-fit bg-mint text-sm"><CheckCircle2 className="h-4 w-4" /> Déjà réussi</span>
                ) : (
                  <span className="sticker w-fit text-sm"><Lock className="h-4 w-4" /> Reviens demain</span>
                )
              ) : (
                <Link href="/jeux/defi" className="btn btn-tomato btn-lg w-fit">
                  Relever le défi <ArrowRight className="h-5 w-5" />
                </Link>
              )}

              {!user && (
                <p className="text-ink/80">
                  <Link href="/login" className="link">Connecte-toi</Link> pour sauvegarder ta progression.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="panel flex h-40 items-center justify-center">
            <p className="font-bold">Aucun défi disponible pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}

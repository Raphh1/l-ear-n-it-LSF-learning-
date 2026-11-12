'use client';

import { Check, Zap } from 'lucide-react';
import type { DailyQuest } from '@/lib/types';

interface Props {
  quests: DailyQuest[] | null;
  isLoading: boolean;
}

export function DailyQuestsWidget({ quests, isLoading }: Props) {
  if (isLoading) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-extrabold">Quêtes du jour</h2>
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20" />)}
        </div>
      </section>
    );
  }

  if (!quests || quests.length === 0) return null;

  const allDone = quests.every((q) => q.isCompleted);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold">Quêtes du jour</h2>
        {allDone && <span className="sticker rotate-2 bg-mint">Toutes complétées !</span>}
      </div>

      <div className="flex flex-col gap-3">
        {quests.map((quest) => {
          const pct = Math.min((quest.currentValue / quest.targetValue) * 100, 100);
          return (
            <div key={quest.questType} className={`panel-flat p-4 ${quest.isCompleted ? 'bg-mint' : ''}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink ${quest.isCompleted ? 'bg-white' : 'bg-paper'}`}>
                    {quest.isCompleted && <Check className="h-4 w-4" strokeWidth={3} />}
                  </span>
                  <span className="font-bold">{quest.label}</span>
                </div>
                <span className="sticker shrink-0 bg-sun"><Zap className="h-3 w-3" /> +{quest.xpReward} XP</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="bar flex-1"><span className={quest.isCompleted ? 'bg-ink' : 'bg-sun'} style={{ width: `${pct}%` }} /></div>
                <span className="w-12 text-right font-bold tabular-nums">{quest.currentValue}/{quest.targetValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

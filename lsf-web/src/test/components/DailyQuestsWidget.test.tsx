import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyQuestsWidget } from '@/components/profile/DailyQuestsWidget';
import type { DailyQuest } from '@/lib/types';

const makeQuest = (overrides: Partial<DailyQuest> = {}): DailyQuest => ({
  questType: 'play_game',
  label: 'Jouer une partie',
  targetValue: 1,
  currentValue: 0,
  isCompleted: false,
  xpReward: 20,
  ...overrides,
});

describe('DailyQuestsWidget', () => {
  it('renders skeleton placeholders while loading', () => {
    const { container } = render(<DailyQuestsWidget quests={null} isLoading={true} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders nothing when quests is null and not loading', () => {
    const { container } = render(<DailyQuestsWidget quests={null} isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when quests array is empty', () => {
    const { container } = render(<DailyQuestsWidget quests={[]} isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a quest label', () => {
    const quests = [makeQuest({ label: 'Jouer une partie' })];
    render(<DailyQuestsWidget quests={quests} isLoading={false} />);
    expect(screen.getByText('Jouer une partie')).toBeInTheDocument();
  });

  it('renders XP reward', () => {
    const quests = [makeQuest({ xpReward: 30 })];
    render(<DailyQuestsWidget quests={quests} isLoading={false} />);
    expect(screen.getByText('+30 XP')).toBeInTheDocument();
  });

  it('shows progress fraction (currentValue/targetValue)', () => {
    const quests = [makeQuest({ currentValue: 5, targetValue: 10 })];
    render(<DailyQuestsWidget quests={quests} isLoading={false} />);
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('shows "Toutes complétées !" when all quests are done', () => {
    const quests = [
      makeQuest({ questType: 'q1', isCompleted: true }),
      makeQuest({ questType: 'q2', isCompleted: true }),
    ];
    render(<DailyQuestsWidget quests={quests} isLoading={false} />);
    expect(screen.getByText('Toutes complétées !')).toBeInTheDocument();
  });

  it('does NOT show "Toutes complétées !" when some quests are pending', () => {
    const quests = [
      makeQuest({ questType: 'q1', isCompleted: true }),
      makeQuest({ questType: 'q2', isCompleted: false }),
    ];
    render(<DailyQuestsWidget quests={quests} isLoading={false} />);
    expect(screen.queryByText('Toutes complétées !')).not.toBeInTheDocument();
  });

  it('renders multiple quests', () => {
    const quests = [
      makeQuest({ questType: 'play_game', label: 'Jouer une partie' }),
      makeQuest({ questType: 'review_signs', label: 'Réviser des signes' }),
      makeQuest({ questType: 'daily_challenge', label: 'Défi du jour' }),
    ];
    render(<DailyQuestsWidget quests={quests} isLoading={false} />);
    expect(screen.getByText('Jouer une partie')).toBeInTheDocument();
    expect(screen.getByText('Réviser des signes')).toBeInTheDocument();
    expect(screen.getByText('Défi du jour')).toBeInTheDocument();
  });
});

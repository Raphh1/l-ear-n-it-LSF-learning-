import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileXpBar } from '@/components/profile/ProfileXpBar';

// framer-motion uses requestAnimationFrame; polyfill for jsdom
global.requestAnimationFrame = (cb) => { cb(0); return 0; };

describe('ProfileXpBar', () => {
  const defaultProps = {
    level: 1,
    xpTotal: 50,
    xpInLevel: 50,
    xpForNext: 100,
    isLoading: false,
  };

  it('displays the level number', () => {
    render(<ProfileXpBar {...defaultProps} />);
    expect(screen.getByText(/Niveau 1/i)).toBeInTheDocument();
  });

  it('displays the level label for level 1 (Débutant)', () => {
    render(<ProfileXpBar {...defaultProps} level={1} />);
    expect(screen.getByText('Débutant')).toBeInTheDocument();
  });

  it('displays the level label for level 2 (Intermédiaire)', () => {
    render(<ProfileXpBar {...defaultProps} level={2} xpTotal={150} xpInLevel={50} />);
    expect(screen.getByText('Intermédiaire')).toBeInTheDocument();
  });

  it('displays the level label for level 3 (Avancé)', () => {
    render(<ProfileXpBar {...defaultProps} level={3} xpTotal={250} xpInLevel={50} />);
    expect(screen.getByText('Avancé')).toBeInTheDocument();
  });

  it('displays total XP', () => {
    render(<ProfileXpBar {...defaultProps} xpTotal={42} />);
    expect(screen.getByText(/42 XP/)).toBeInTheDocument();
  });

  it('displays xpInLevel progress text', () => {
    render(<ProfileXpBar {...defaultProps} xpInLevel={30} xpForNext={100} />);
    expect(screen.getByText('30 XP')).toBeInTheDocument();
  });

  it('shows dashes instead of values when loading', () => {
    render(<ProfileXpBar {...defaultProps} isLoading={true} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('does not show level label when loading', () => {
    render(<ProfileXpBar {...defaultProps} level={1} isLoading={true} />);
    expect(screen.queryByText('Débutant')).not.toBeInTheDocument();
  });

  it('shows "XP pour le niveau N+1" footer', () => {
    render(<ProfileXpBar {...defaultProps} level={2} xpForNext={100} />);
    expect(screen.getByText(/XP pour le niveau 3/)).toBeInTheDocument();
  });
});

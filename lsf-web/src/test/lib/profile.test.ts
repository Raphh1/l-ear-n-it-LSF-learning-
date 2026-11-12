import { describe, it, expect } from 'vitest';
import { getLevelFromXp } from '@/lib/profile';

describe('getLevelFromXp', () => {
  it('level 1 at 0 XP', () => {
    const result = getLevelFromXp(0);
    expect(result.level).toBe(1);
    expect(result.xpInLevel).toBe(0);
    expect(result.xpForNext).toBe(100);
  });

  it('level 1 at 99 XP', () => {
    const result = getLevelFromXp(99);
    expect(result.level).toBe(1);
    expect(result.xpInLevel).toBe(99);
  });

  it('level 2 at exactly 100 XP', () => {
    const result = getLevelFromXp(100);
    expect(result.level).toBe(2);
    expect(result.xpInLevel).toBe(0);
  });

  it('level 2 at 150 XP — 50 XP into level', () => {
    const result = getLevelFromXp(150);
    expect(result.level).toBe(2);
    expect(result.xpInLevel).toBe(50);
  });

  it('level 3 at 200 XP', () => {
    const result = getLevelFromXp(200);
    expect(result.level).toBe(3);
    expect(result.xpInLevel).toBe(0);
  });

  it('xpForNext is always 100', () => {
    expect(getLevelFromXp(0).xpForNext).toBe(100);
    expect(getLevelFromXp(350).xpForNext).toBe(100);
  });

  it('large XP value', () => {
    const result = getLevelFromXp(1050);
    expect(result.level).toBe(11);
    expect(result.xpInLevel).toBe(50);
  });
});

import { describe, it, expect } from 'vitest';
import { calculateElo, expectedScore, getKFactor } from '../../lib/chess/elo';

describe('Elo Calculation', () => {
  it('should calculate K factor correctly', () => {
    expect(getKFactor(1200, 5)).toBe(40);
    expect(getKFactor(1500, 50)).toBe(32);
    expect(getKFactor(2200, 100)).toBe(16);
  });

  it('should have expected score near 0.5 for equal elo', () => {
    const score = expectedScore(1500, 1500);
    expect(score).toBeCloseTo(0.5, 1);
  });

  it('should favor higher rated player', () => {
    const score = expectedScore(1700, 1500);
    expect(score).toBeGreaterThan(0.5);
    expect(score).toBeLessThan(1);
  });

  it('should calculate Elo update for white win', () => {
    const result = calculateElo(1500, 1500, 'white', 50, 50);
    expect(result.white.delta).toBeGreaterThan(0);
    expect(result.black.delta).toBeLessThan(0);
  });

  it('should calculate Elo update for black win', () => {
    const result = calculateElo(1500, 1500, 'black', 50, 50);
    expect(result.black.delta).toBeGreaterThan(0);
    expect(result.white.delta).toBeLessThan(0);
  });

  it('should handle draw (equal elo)', () => {
    const result = calculateElo(1500, 1500, 'draw', 50, 50);
    expect(result.white.delta).toBe(0);
    expect(result.black.delta).toBe(0);
  });

  it('should transfer more points when lower rated beats higher rated', () => {
    const lowWin = calculateElo(1200, 1800, 'white', 50, 50);
    const highWin = calculateElo(1800, 1200, 'white', 50, 50);
    expect(lowWin.white.delta).toBeGreaterThan(highWin.white.delta);
  });

  it('should never go below 100 elo', () => {
    const result = calculateElo(150, 2000, 'black', 50, 50);
    expect(result.black.newElo).toBeGreaterThanOrEqual(100);
    expect(result.white.newElo).toBeGreaterThanOrEqual(100);
  });

  it('should use K=40 for new players (<30 games)', () => {
    const newPlayer = calculateElo(1200, 1200, 'white', 5, 100);
    const experienced = calculateElo(1200, 1200, 'white', 100, 100);
    expect(newPlayer.white.delta).toBeGreaterThan(experienced.white.delta);
  });

  it('should handle null result (no change)', () => {
    const result = calculateElo(1500, 1500, null, 50, 50);
    expect(result.white.delta).toBe(0);
    expect(result.black.delta).toBe(0);
  });

  it('should calculate expected score correctly for large gaps', () => {
    const score = expectedScore(2400, 1200);
    expect(score).toBeGreaterThan(0.99);
  });
});

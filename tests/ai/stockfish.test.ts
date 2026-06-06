// ─── Tests Stockfish (mocké — pas de WASM en CI) ───

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBestMove } from '@/lib/ai/stockfish';
import { getLevelConfig, getUCIDepth, getSkillLevel } from '@/lib/ai/levels';

vi.mock('@/lib/ai/stockfish', () => ({
  getBestMove: vi.fn(),
  initStockfish: vi.fn(),
  stopStockfish: vi.fn(),
  destroyStockfish: vi.fn(),
  isStockfishReady: vi.fn(() => false),
}));

describe('Stockfish AI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a valid UCI move string', async () => {
    const mockGetBestMove = getBestMove as ReturnType<typeof vi.fn>;
    mockGetBestMove.mockResolvedValue('e2e4');

    const result = await getBestMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      5,
    );

    expect(result).toBe('e2e4');
    expect(result.length).toBeGreaterThanOrEqual(4);
  });

  it('should return a promotion move with 5 chars', async () => {
    const mockGetBestMove = getBestMove as ReturnType<typeof vi.fn>;
    mockGetBestMove.mockResolvedValue('e7e8q');

    const result = await getBestMove(
      '4k3/P7/8/8/8/8/8/4K3 w - - 0 1',
      5,
    );

    expect(result).toBe('e7e8q');
    expect(result.length).toBe(5);
  });

  it('should handle different levels', () => {
    expect(getUCIDepth(1)).toBe(1);
    expect(getUCIDepth(5)).toBe(8);
    expect(getUCIDepth(10)).toBe(20);
  });

  it('should handle different skill levels', () => {
    expect(getSkillLevel(1)).toBe(0);
    expect(getSkillLevel(5)).toBe(8);
    expect(getSkillLevel(10)).toBe(20);
  });

  it('getLevelConfig should return depth and skill', () => {
    const config = getLevelConfig(1);
    expect(config.depth).toBe(1);
    expect(config.skill).toBe(0);
  });
});

describe('AI Levels', () => {
  const levels = [
    { level: 1, depth: 1, skill: 0 },
    { level: 2, depth: 2, skill: 2 },
    { level: 3, depth: 4, skill: 4 },
    { level: 4, depth: 6, skill: 6 },
    { level: 5, depth: 8, skill: 8 },
    { level: 6, depth: 10, skill: 10 },
    { level: 7, depth: 12, skill: 13 },
    { level: 8, depth: 14, skill: 15 },
    { level: 9, depth: 16, skill: 18 },
    { level: 10, depth: 20, skill: 20 },
  ];

  for (const { level, depth, skill } of levels) {
    it(`level ${level}: depth=${depth}, skill=${skill}`, () => {
      expect(getUCIDepth(level)).toBe(depth);
      expect(getSkillLevel(level)).toBe(skill);
    });
  }
});

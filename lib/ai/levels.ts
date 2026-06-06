// Mapping niveau utilisateur (1-10) → profondeur UCI (depth)
// Niveau 1 = depth 1 (très faible, erreurs fréquentes)
// Niveau 10 = depth 20 (très fort, ~GM)

export interface LevelConfig {
  depth: number;
  skill: number;   // 0-20, Stockfish skill level
  name: string;
  description: string;
}

export const LEVELS: Record<number, LevelConfig> = {
  1:  { depth: 1,  skill: 0,  name: '🟢 Débutant',      description: 'Joue des coups aléatoires avec quelques bons coups' },
  2:  { depth: 2,  skill: 2,  name: '🟢 Novice',        description: 'Saisit les bases mais fait encore des erreurs' },
  3:  { depth: 4,  skill: 4,  name: '🟢 Amateur',       description: 'Connaît les ouvertures simples' },
  4:  { depth: 6,  skill: 6,  name: '🟡 Intermédiaire', description: 'Planifie à court terme' },
  5:  { depth: 8,  skill: 8,  name: '🟡 Club',          description: 'Niveau club d\'échecs' },
  6:  { depth: 10, skill: 10, name: '🟡 Confirmé',      description: 'Bon joueur de club' },
  7:  { depth: 12, skill: 13, name: '🟠 Fort',           description: 'Joueur de tournoi solide' },
  8:  { depth: 14, skill: 15, name: '🟠 Expert',        description: 'Proche du niveau maître' },
  9:  { depth: 16, skill: 18, name: '🔴 Maître',        description: 'Niveau maître FIDE (2200+)' },
  10: { depth: 20, skill: 20, name: '🔴 Grand Maître',  description: 'Niveau GM (2500+)' },
};

export function getLevelConfig(level: number): LevelConfig {
  const clamped = Math.max(1, Math.min(10, level));
  return LEVELS[clamped];
}

export function getUCIDepth(level: number): number {
  return getLevelConfig(level).depth;
}

export function getSkillLevel(level: number): number {
  return getLevelConfig(level).skill;
}

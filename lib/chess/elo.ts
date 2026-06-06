import type { GameResult } from './types';

// ─── Algorithme Elo standard ───
// K=32 pour joueurs <2000, K=16 pour joueurs >=2000
// K=40 pour les 30 premières parties (période de placement)

export function getKFactor(elo: number, gamesPlayed: number): number {
  if (gamesPlayed < 30) return 40;
  if (elo < 2000) return 32;
  return 16;
}

export function expectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

export interface EloUpdate {
  white: { newElo: number; delta: number };
  black: { newElo: number; delta: number };
}

export function calculateElo(
  whiteElo: number,
  blackElo: number,
  result: GameResult,
  whiteGames?: number,
  blackGames?: number
): EloUpdate {
  const wExpected = expectedScore(whiteElo, blackElo);
  const bExpected = expectedScore(blackElo, whiteElo);

  let wScore: number;
  let bScore: number;

  switch (result) {
    case 'white':
      wScore = 1;
      bScore = 0;
      break;
    case 'black':
      wScore = 0;
      bScore = 1;
      break;
    case 'draw':
      wScore = 0.5;
      bScore = 0.5;
      break;
    default:
      return {
        white: { newElo: whiteElo, delta: 0 },
        black: { newElo: blackElo, delta: 0 },
      };
  }

  const wK = getKFactor(whiteElo, whiteGames ?? 0);
  const bK = getKFactor(blackElo, blackGames ?? 0);

  const wDelta = Math.round(wK * (wScore - wExpected));
  const bDelta = Math.round(bK * (bScore - bExpected));

  return {
    white: { newElo: Math.max(100, whiteElo + wDelta), delta: wDelta },
    black: { newElo: Math.max(100, blackElo + bDelta), delta: bDelta },
  };
}

// Calcule la différence Elo après une série de parties
export function calculateSeries(
  initialElo: number,
  results: { opponentElo: number; result: GameResult; gamesPlayed?: number }[]
): number {
  let elo = initialElo;
  let games = 0;

  for (const r of results) {
    games++;
    const update = calculateElo(
      elo,
      r.opponentElo,
      r.result,
      games,
      r.gamesPlayed ?? games
    );
    elo = r.result === 'white'
      ? update.white.newElo
      : r.result === 'black'
        ? update.black.newElo
        : elo; // draw
  }

  return elo;
}

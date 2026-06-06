// ─── Moteur minimax simple (fallback si Stockfish WASM indisponible) ───
// Retourne des coups en format UCI (ex: "e2e4", "g1f3") pour compatibilité

import { Chess } from 'chess.js';

// Valeurs des pièces (centipawns)
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Tables de position pour les pions
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0],
];

function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type] || 0;
      const idx = piece.color === 'w' ? rank : 7 - rank;
      const posBonus = piece.type === 'p' ? PAWN_TABLE[idx][file] : 0;
      const sign = piece.color === 'w' ? 1 : -1;
      score += sign * (value + posBonus);
    }
  }
  // Bonus pour la mobilité
  const moves = chess.moves().length;
  score += moves * 2;
  return score;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    if (chess.isCheckmate()) return isMaximizing ? -100000 + depth : 100000 - depth;
    if (chess.isDraw() || chess.isStalemate()) return 0;
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });
  // Trier par valeur de capture pour meilleur pruning
  moves.sort((a, b) => {
    const aVal = a.captured ? PIECE_VALUES[a.captured] || 0 : 0;
    const bVal = b.captured ? PIECE_VALUES[b.captured] || 0 : 0;
    return bVal - aVal;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newChess = new Chess(chess.fen());
      newChess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const evalScore = minimax(newChess, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newChess = new Chess(chess.fen());
      newChess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const evalScore = minimax(newChess, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Retourne le meilleur coup en format UCI (ex: "e2e4", "g1f3")
 * Utilisé comme fallback quand Stockfish WASM n'est pas disponible.
 */
export function getFallbackMoveUCI(fen: string, depth: number = 3): string | null {
  try {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    let bestMove: string | null = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      const newChess = new Chess(chess.fen());
      newChess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const score = minimax(newChess, depth - 1, -Infinity, Infinity, false);

      if (score > bestScore) {
        bestScore = score;
        // Retourner en UCI: from + to (+ promotion si applicable)
        bestMove = move.from + move.to + (move.promotion || '');
      }
    }

    return bestMove;
  } catch {
    return null;
  }
}

// Détection simple de matériel insuffisant
export function hasSufficientMaterial(fen: string): boolean {
  const chess = new Chess(fen);
  const pieces = chess.board().flat().filter(Boolean);
  if (pieces.length <= 2) return false;
  const nonKing = pieces.filter(p => p && p.type !== 'k');
  if (nonKing.length <= 1) {
    const type = nonKing[0]?.type;
    if (type === 'b' || type === 'n') return false;
  }
  return true;
}

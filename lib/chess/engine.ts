import { Chess } from 'chess.js';
import type {
  GameStatus,
  GameResult,
  EndReason,
  Move,
  Square,
  Color,
  Piece,
  PieceType,
} from './types';

// ─── Wrapper autour de chess.js avec types stricts ───

export function createGame(): Chess {
  return new Chess();
}

export function getLegalMoves(chess: Chess, square?: Square): Move[] {
  const moves = square
    ? chess.moves({ square, verbose: true })
    : chess.moves({ verbose: true });

  return moves.map((m) => ({
    from: m.from as Square,
    to: m.to as Square,
    promotion: m.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    captured: m.captured
      ? { type: m.captured as PieceType, color: m.color === 'w' ? 'b' : 'w' }
      : undefined,
    san: m.san,
  }));
}

export function applyMove(
  chess: Chess,
  move: { from: string; to: string; promotion?: string }
): Chess {
  const result = new Chess(chess.fen());
  result.move({ from: move.from, to: move.to, promotion: move.promotion });
  return result;
}

export function getGameStatus(chess: Chess): GameStatus {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) return 'checkmate';
    if (chess.isStalemate()) return 'stalemate';
    if (chess.isDraw()) return 'draw';
  }
  if (chess.isCheck()) return 'check';
  return 'active';
}

export function getGameResult(chess: Chess): GameResult {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? 'black' : 'white';
  }
  if (chess.isDraw() || chess.isStalemate()) return 'draw';
  return null;
}

export function getEndReason(chess: Chess): EndReason | null {
  if (chess.isCheckmate()) return 'checkmate';
  if (chess.isStalemate()) return 'stalemate';
  if (chess.isDraw()) {
    if (chess.isThreefoldRepetition()) return 'threefold_repetition';
    if (chess.isInsufficientMaterial()) return 'insufficient_material';
    return 'draw_agreement'; // fifty-move or agreement
  }
  return null;
}

export function isCheck(chess: Chess): boolean {
  return chess.isCheck();
}

export function isCheckmate(chess: Chess): boolean {
  return chess.isCheckmate();
}

export function isDraw(chess: Chess): boolean {
  return chess.isDraw();
}

export function isStalemate(chess: Chess): boolean {
  return chess.isStalemate();
}

export function isGameOver(chess: Chess): boolean {
  return chess.isGameOver();
}

export function toFEN(chess: Chess): string {
  return chess.fen();
}

export function fromFEN(fen: string): Chess {
  return new Chess(fen);
}

export function getPieceAt(chess: Chess, square: Square): Piece | null {
  const p = chess.get(square);
  if (!p) return null;
  return { type: p.type as PieceType, color: p.color as Color };
}

export function getTurn(chess: Chess): Color {
  return chess.turn() as Color;
}

export function getMoveHistory(chess: Chess): string[] {
  return chess.history();
}

export function getMoveCount(chess: Chess): number {
  return chess.moveNumber();
}

// Convertit un coup chess.js en notre format Move
export function toMove(m: { from: string; to: string; promotion?: string; san?: string; captured?: Piece }): Move {
  return {
    from: m.from as Square,
    to: m.to as Square,
    promotion: m.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    captured: m.captured,
    san: m.san,
  };
}

// Réinitialise une partie (nouvelle position initiale)
export function resetGame(): Chess {
  return new Chess();
}

// Joue un coup depuis une notation SAN
export function moveFromSAN(chess: Chess, san: string): Chess {
  const result = new Chess(chess.fen());
  result.move(san);
  return result;
}

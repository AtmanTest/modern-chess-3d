// ─── Validation des coups côté serveur (anti-triche) ───

import { Chess } from 'chess.js';
import type { GameStatus, EndReason, GameResult } from '@/lib/chess/types';

export interface ValidatedMove {
  valid: true;
  san: string;
  fen: string;
  status: GameStatus;
  result: GameResult;
  endReason: EndReason | null;
  pgn: string;
}

export interface InvalidMove {
  valid: false;
  reason: string;
}

export type MoveValidationResult = ValidatedMove | InvalidMove;

export function validateMove(
  game: Chess,
  from: string,
  to: string,
  promotion?: string,
): MoveValidationResult {
  try {
    const move = game.move({
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    });

    const status = getGameStatus(game);
    const { result, endReason } = getGameResult(game, status);

    return {
      valid: true,
      san: move.san,
      fen: game.fen(),
      status,
      result,
      endReason,
      pgn: game.pgn(),
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid move';
    return { valid: false, reason: message };
  }
}

export function validateFenTransition(
  game: Chess,
  from: string,
  to: string,
  fen: string,
): boolean {
  // Snapshot test: clone and apply the move, check FEN matches
  try {
    const clone = new Chess(game.fen());
    const move = clone.move({
      from: from.toLowerCase(),
      to: to.toLowerCase(),
    });
    return clone.fen() === fen;
  } catch {
    return false;
  }
}

function getGameStatus(game: Chess): GameStatus {
  if (game.isCheckmate()) return 'checkmate';
  if (game.isStalemate()) return 'stalemate';
  if (game.isDraw()) return 'draw';
  if (game.isCheck()) return 'check';
  return 'active';
}

function getGameResult(
  game: Chess,
  status: GameStatus,
): { result: GameResult; endReason: EndReason | null } {
  switch (status) {
    case 'checkmate':
      return {
        result: game.turn() === 'w' ? 'black' : 'white',
        endReason: 'checkmate',
      };
    case 'stalemate':
      return { result: 'draw', endReason: 'stalemate' };
    case 'draw':
      if (game.isThreefoldRepetition())
        return { result: 'draw', endReason: 'threefold_repetition' };
      if (game.isInsufficientMaterial())
        return { result: 'draw', endReason: 'insufficient_material' };
      if (game.isDraw()) return { result: 'draw', endReason: 'fifty_moves' };
      return { result: 'draw', endReason: null };
    default:
      return { result: null, endReason: null };
  }
}

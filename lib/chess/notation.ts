import { Chess } from 'chess.js';

import type { Color } from './types';

// ─── FEN ↔ PGN conversions ───

export function exportPGN(chess: Chess, meta?: {
  white?: string;
  black?: string;
  result?: string;
  date?: string;
  event?: string;
}): string {
  const pgn: string[] = [];

  // En-têtes
  if (meta?.event) pgn.push(`[Event "${meta.event}"]`);
  pgn.push(`[Site "Modern Chess 3D"]`);
  if (meta?.date) pgn.push(`[Date "${meta.date}"]`);
  pgn.push(`[Round "1"]`);
  if (meta?.white) pgn.push(`[White "${meta.white}"]`);
  if (meta?.black) pgn.push(`[Black "${meta.black}"]`);
  if (meta?.result) {
    pgn.push(`[Result "${meta.result}"]`);
  } else {
    pgn.push(`[Result "*"]`);
  }

  pgn.push('');

  // Coups
  const history = chess.history({ verbose: false });
  for (let i = 0; i < history.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    const whiteMove = history[i];
    const blackMove = history[i + 1];
    if (blackMove) {
      pgn.push(`${moveNum}. ${whiteMove} ${blackMove}`);
    } else {
      pgn.push(`${moveNum}. ${whiteMove}`);
    }
  }

  if (meta?.result) {
    pgn.push(meta.result);
  }

  return pgn.join(' ');
}

export function parsePGN(pgn: string): Chess | null {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    return chess;
  } catch {
    return null;
  }
}

export function fenToBoard(fen: string): (string | null)[][] {
  const board: (string | null)[][] = [];
  const rows = fen.split(' ')[0].split('/');

  for (const row of rows) {
    const boardRow: (string | null)[] = [];
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        const empty = parseInt(ch);
        for (let i = 0; i < empty; i++) boardRow.push(null);
      } else {
        boardRow.push(ch);
      }
    }
    board.push(boardRow);
  }

  return board;
}

export function fenToPositionMap(fen: string): Map<string, string> {
  const pos = new Map<string, string>();
  const board = fenToBoard(fen);
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece) {
        const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
        pos.set(square, piece);
      }
    }
  }
  return pos;
}

export function getTurnFromFEN(fen: string): Color {
  return fen.split(' ')[1] as Color;
}

export function getCastlingRights(fen: string): string {
  return fen.split(' ')[2];
}

export function getEnPassantTarget(fen: string): string | null {
  const ep = fen.split(' ')[3];
  return ep === '-' ? null : ep;
}

export function getHalfMoveClock(fen: string): number {
  return parseInt(fen.split(' ')[4]);
}

export function getFullMoveNumber(fen: string): number {
  return parseInt(fen.split(' ')[5]);
}

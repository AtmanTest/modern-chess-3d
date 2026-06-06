import { Chess } from 'chess.js';
import type { Square, Color, Piece, PieceType } from './types';

// ─── Helpers ───

export function isSquareLight(square: Square): boolean {
  const file = square.charCodeAt(0) - 97; // 0-7
  const rank = parseInt(square[1]) - 1;   // 0-7
  return (file + rank) % 2 === 0;
}

export function isSquareDark(square: Square): boolean {
  return !isSquareLight(square);
}

export function getPieceUnicode(type: PieceType, color: Color): string {
  const map: Record<string, string> = {
    wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
    bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
  };
  return map[`${color}${type}`] || '?';
}

export function getPieceName(type: PieceType, color: Color): string {
  const names: Record<PieceType, string> = {
    k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn',
  };
  const side = color === 'w' ? 'White' : 'Black';
  return `${side} ${names[type]}`;
}

// Obtenir le temps initial en ms selon le time control
export function getTimeMs(control: string): number {
  switch (control) {
    case 'bullet':    return 60_000;     // 1 min
    case 'blitz':     return 180_000;    // 3 min
    case 'rapid':     return 600_000;    // 10 min
    default:          return Infinity;   // illimité
  }
}

// Formater ms en affichage mm:ss
export function formatTime(ms: number): string {
  if (ms === Infinity) return '--:--';
  if (ms <= 0) return '0:00';
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Valide qu'une couleur est bien 'w' ou 'b'
export function isValidColor(c: string): c is Color {
  return c === 'w' || c === 'b';
}

// Valide qu'une case est bien une case d'échecs
export function isValidSquare(s: string): s is Square {
  return /^[a-h][1-8]$/.test(s);
}

// Vérifie si une chaîne est un FEN valide (basique)
export function isValidFEN(fen: string): boolean {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

// Génère un tableau 2D depuis un Chess
export function boardToGrid(chess: Chess): (Piece | null)[][] {
  const grid: (Piece | null)[][] = [];
  for (let rank = 7; rank >= 0; rank--) {
    const row: (Piece | null)[] = [];
    for (let file = 0; file < 8; file++) {
      const sq = `${String.fromCharCode(97 + file)}${rank + 1}`;
      const p = chess.get(sq as Square);
      if (p) {
        row.push({ type: p.type as PieceType, color: p.color as Color });
      } else {
        row.push(null);
      }
    }
    grid.push(row);
  }
  return grid;
}

// Couleurs pour le thème sombre premium
export const BOARD_THEME = {
  light: '#b58863',
  dark: '#769656',
  lightPremium: '#f0d9b5',
  darkPremium: '#b58863',
  highlight: 'rgba(255, 215, 0, 0.4)',
  lastMove: 'rgba(155, 199, 0, 0.41)',
  check: 'rgba(255, 0, 0, 0.6)',
  legalMove: 'rgba(0, 0, 0, 0.2)',
};

// ─── Types fondamentaux pour le moteur d'échecs ───

export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Square =
  | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6' | 'a7' | 'a8'
  | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'b7' | 'b8'
  | 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8'
  | 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8'
  | 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7' | 'e8'
  | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8'
  | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'g7' | 'g8'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8';

export interface Move {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
  captured?: Piece;
  san?: string;
}

export type GameStatus =
  | 'active'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw';
export type GameResult = 'white' | 'black' | 'draw' | null;
export type EndReason =
  | 'checkmate'
  | 'resign'
  | 'timeout'
  | 'draw_agreement'
  | 'stalemate'
  | 'threefold_repetition'
  | 'insufficient_material'
  | 'fifty_moves';
export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'unlimited';
export type GameMode = 'vs_ai' | 'online' | 'local';

export interface Player {
  id?: string;
  name: string;
  color: Color;
  elo: number;
  timeMs: number;
}

export interface Game {
  id?: string;
  fen: string;
  pgn: string;
  turn: Color;
  status: GameStatus;
  moves: Move[];
  moveHistory: string[];   // SAN notation list
  white: Player;
  black: Player;
  result: GameResult;
  endReason: EndReason | null;
  mode: GameMode;
  timeControl: TimeControl;
  aiLevel?: number;
  startedAt: string;
  endedAt?: string;
}

export function createDefaultGame(
  mode: GameMode = 'local',
  timeControl: TimeControl = 'unlimited'
): Game {
  return {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    pgn: '',
    turn: 'w',
    status: 'active',
    moves: [],
    moveHistory: [],
    white: { name: 'White', color: 'w', elo: 1200, timeMs: 600000 },
    black: { name: 'Black', color: 'b', elo: 1200, timeMs: 600000 },
    result: null,
    endReason: null,
    mode,
    timeControl,
    startedAt: new Date().toISOString(),
  };
}

export function squareToIndex(sq: Square): number {
  const file = sq.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(sq[1]) - 1;   // 1=0, 8=7
  return rank * 8 + file;
}

export function indexToSquare(idx: number): Square {
  const file = idx % 8;
  const rank = Math.floor(idx / 8);
  return String.fromCharCode(97 + file) + (rank + 1) as Square;
}

export function oppositeColor(c: Color): Color {
  return c === 'w' ? 'b' : 'w';
}

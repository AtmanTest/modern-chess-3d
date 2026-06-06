import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import {
  createGame,
  applyMove,
  getGameStatus,
  getGameResult,
  isCheckmate,
  isStalemate,
  isDraw,
  isCheck,
  toFEN,
  fromFEN,
  getLegalMoves,
  getPieceAt,
} from '../../lib/chess/engine';

describe('Chess Rules Engine', () => {
  it('should initialize a standard board', () => {
    const chess = createGame();
    expect(chess.board().length).toBe(8);
    expect(getPieceAt(chess, 'e1')?.type).toBe('k');
    expect(getPieceAt(chess, 'd1')?.type).toBe('q');
    expect(getPieceAt(chess, 'e8')?.type).toBe('k');
    expect(getPieceAt(chess, 'd8')?.type).toBe('q');
  });

  it('should get legal moves for e2 pawn', () => {
    const chess = createGame();
    const moves = getLegalMoves(chess, 'e2');
    expect(moves.length).toBe(2); // e3 and e4
    expect(moves.some((m) => m.to === 'e4')).toBe(true);
    expect(moves.some((m) => m.to === 'e3')).toBe(true);
  });

  it('should apply a move and update the board', () => {
    const chess = createGame();
    chess.move('e4');
    expect(getPieceAt(chess, 'e4')?.type).toBe('p');
    expect(getPieceAt(chess, 'e2')).toBeNull();
    expect(chess.turn()).toBe('b');
  });

  it('should detect Scholar\'s Mate (checkmate in 4 moves)', () => {
    const chess = createGame();

    // 1. e4 e5
    chess.move('e4');
    chess.move('e5');
    // 2. Bc4 Nc6
    chess.move('Bc4');
    chess.move('Nc6');
    // 3. Qh5 Nf6
    chess.move('Qh5');
    chess.move('Nf6');
    // 4. Qxf7#
    chess.move('Qxf7');

    expect(isCheckmate(chess)).toBe(true);
    expect(getGameStatus(chess)).toBe('checkmate');
    expect(getGameResult(chess)).toBe('white');
  });

  it('should detect stalemate', () => {
    // Position de pat célèbre
    const chess2 = new Chess('k7/8/1Q6/K7/8/8/8/8 b - - 0 1');
    expect(isStalemate(chess2)).toBe(true);
    expect(getGameStatus(chess2)).toBe('stalemate');
  });

  it('should handle castling kingside', () => {
    const chess = new Chess('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    chess.move('O-O');

    expect(getPieceAt(chess, 'g1')?.type).toBe('k');
    expect(getPieceAt(chess, 'f1')?.type).toBe('r');
    expect(getPieceAt(chess, 'h1')).toBeNull();
    expect(getPieceAt(chess, 'e1')).toBeNull();
  });

  it('should handle castling queenside', () => {
    const chess = new Chess('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    chess.move('O-O-O');

    expect(getPieceAt(chess, 'c1')?.type).toBe('k');
    expect(getPieceAt(chess, 'd1')?.type).toBe('r');
    expect(getPieceAt(chess, 'a1')).toBeNull();
    expect(getPieceAt(chess, 'e1')).toBeNull();
  });

  it('should handle en passant capture', () => {
    const chess = new Chess('4k3/8/8/8/Pp6/8/8/4K3 b - a3 0 1');
    chess.move('bxa3');
    expect(getPieceAt(chess, 'a3')?.type).toBe('p');
    expect(getPieceAt(chess, 'a3')?.color).toBe('b');
    expect(getPieceAt(chess, 'a4')).toBeNull();
  });

  it('should handle pawn promotion to queen', () => {
    const chess = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
    chess.move('e8=Q');
    expect(getPieceAt(chess, 'e8')?.type).toBe('q');
    expect(getPieceAt(chess, 'e8')?.color).toBe('w');
  });

  it('should handle pawn promotion to knight', () => {
    const chess = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
    chess.move('e8=N');
    expect(getPieceAt(chess, 'e8')?.type).toBe('n');
  });

  it('should detect threefold repetition', () => {
    const chess = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    // Nf3 Nf6 Ng1 Ng8 repeats the starting position
    for (let i = 0; i < 3; i++) {
      chess.move('Nf3');
      chess.move('Nf6');
      chess.move('Ng1');
      chess.move('Ng8');
    }
    expect(chess.isThreefoldRepetition()).toBe(true);
    expect(chess.isDraw()).toBe(true);
  });

  it('should detect insufficient material (K vs K)', () => {
    const chess = new Chess('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
    expect(chess.isInsufficientMaterial()).toBe(true);
  });

  it('should parse and export FEN correctly', () => {
    const chess = createGame();
    const fen = toFEN(chess);
    expect(fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const restored = fromFEN(fen);
    expect(restored.fen()).toBe(fen);
  });

  it('should get full game status correctly', () => {
    const chess = createGame();
    expect(getGameStatus(chess)).toBe('active');

    // Position where black king is in check from white queen on e5 (e7 pawn removed)
    const checkFen = 'rnb1kbnr/pppp1ppp/8/4Q3/8/8/PPPPPPPP/RNB1KBNR b KQkq - 0 1';
    const checkGame = new Chess(checkFen);
    expect(isCheck(checkGame)).toBe(true);
    expect(getGameStatus(checkGame)).toBe('check');
  });

  it('should track move history', () => {
    const chess = createGame();
    chess.move('e4');
    chess.move('e5');
    chess.move('Nf3');
    chess.move('Nc6');

    const history = chess.history();
    expect(history).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
    expect(chess.moveNumber()).toBe(3);
  });
});

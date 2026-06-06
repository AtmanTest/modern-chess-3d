// ─── Zustand Store — État global du jeu ───

import { create } from 'zustand';
import type { Game, GameStatus, Color, GameResult } from '@/lib/chess/types';
import { createDefaultGame } from '@/lib/chess/types';

interface GameStore {
  game: Game;
  isAIThinking: boolean;
  selectedSquare: string | null;
  legalMoves: string[];
  boardFlipped: boolean;
  lastMove: { from: string; to: string } | null;
  moveHistory: string[];
  gameOver: boolean;

  setGame: (game: Game) => void;
  updateFen: (fen: string) => void;
  setTurn: (turn: Color) => void;
  setStatus: (status: GameStatus) => void;
  setAIThinking: (v: boolean) => void;
  selectSquare: (sq: string | null) => void;
  setLegalMoves: (moves: string[]) => void;
  flipBoard: () => void;
  setLastMove: (move: { from: string; to: string } | null) => void;
  addMove: (san: string) => void;
  setGameOver: (v: boolean, result?: GameResult) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  game: createDefaultGame(),
  isAIThinking: false,
  selectedSquare: null,
  legalMoves: [],
  boardFlipped: false,
  lastMove: null,
  moveHistory: [],
  gameOver: false,

  setGame: (game) => set({ game }),
  updateFen: (fen) => set((s) => ({ game: { ...s.game, fen } })),
  setTurn: (turn) => set((s) => ({ game: { ...s.game, turn } })),
  setStatus: (status) => set((s) => ({ game: { ...s.game, status } })),
  setAIThinking: (isAIThinking) => set({ isAIThinking }),
  selectSquare: (selectedSquare) => set({ selectedSquare }),
  setLegalMoves: (legalMoves) => set({ legalMoves }),
  flipBoard: () => set((s) => ({ boardFlipped: !s.boardFlipped })),
  setLastMove: (lastMove) => set({ lastMove }),
  addMove: (san) =>
    set((s) => ({
      moveHistory: [...s.moveHistory, san],
      game: {
        ...s.game,
        moveHistory: [...s.game.moveHistory, san],
      },
    })),
  setGameOver: (gameOver, result) =>
    set((s) => ({
      gameOver,
      game: { ...s.game, result: result ?? s.game.result },
    })),
  resetGame: () =>
    set({
      game: createDefaultGame(),
      isAIThinking: false,
      selectedSquare: null,
      legalMoves: [],
      boardFlipped: false,
      lastMove: null,
      moveHistory: [],
      gameOver: false,
    }),
}));

'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { Chess } from 'chess.js';
import { useGameStore } from '@/lib/store/gameStore';
import { getBestMove } from '@/lib/ai/stockfish';
import type { GameStatus, Color, Square } from '@/lib/chess/types';

const BoardScene = dynamic(
  () => import('@/components/chess3d/BoardScene'),
  { ssr: false },
);

const GameHUD = dynamic(
  () => import('@/components/hud/GameHUD'),
  { ssr: false },
);

const AI_LEVELS = [
  { value: 1, label: 'Débutant' },
  { value: 3, label: 'Facile' },
  { value: 5, label: 'Intermédiaire' },
  { value: 7, label: 'Difficile' },
  { value: 10, label: 'Expert' },
];

export default function VsAIPage() {
  const {
    isAIThinking: storeAIThinking,
    selectedSquare,
    legalMoves,
    boardFlipped,
    lastMove,
    moveHistory,
    gameOver,
    setTurn,
    setStatus,
    setAIThinking,
    selectSquare,
    setLegalMoves,
    flipBoard,
    setLastMove,
    addMove,
    setGameOver,
    resetGame,
  } = useGameStore();

  const [aiLevel, setAiLevel] = useState(5);
  const [chess] = useState(() => new Chess());
  const [playerColor] = useState<Color>('w');
  const [status, setLocalStatus] = useState<GameStatus>('active');
  const [error, setError] = useState<string | null>(null);

  const isAIThinking = storeAIThinking;

  const afterMove = useCallback(() => {
    if (chess.isCheckmate()) {
      setLocalStatus('checkmate');
      setStatus('checkmate');
      setGameOver(true, playerColor === 'w' ? 'white' : 'black');
    } else if (chess.isStalemate()) {
      setLocalStatus('stalemate');
      setStatus('stalemate');
      setGameOver(true, 'draw');
    } else if (chess.isDraw()) {
      setLocalStatus('draw');
      setStatus('draw');
      setGameOver(true, 'draw');
    } else if (chess.isCheck()) {
      setLocalStatus('check');
      setStatus('check');
    } else {
      setLocalStatus('active');
      setStatus('active');
    }
    setTurn(chess.turn() === 'w' ? 'w' : 'b');
  }, [chess, playerColor, setGameOver, setStatus, setTurn]);

  const doAIMove = useCallback(async () => {
    if (chess.isGameOver()) return;
    setAIThinking(true);
    try {
      const aiMoveUci = await getBestMove(chess.fen(), aiLevel);
      if (aiMoveUci && aiMoveUci.length >= 4) {
        const fromUci = aiMoveUci.slice(0, 2);
        const toUci = aiMoveUci.slice(2, 4);
        const promoUci = aiMoveUci.length > 4 ? aiMoveUci[4] : undefined;
        chess.move({
          from: fromUci as Square,
          to: toUci as Square,
          promotion: promoUci as 'q' | 'r' | 'b' | 'n' | undefined,
        });
        setLastMove({ from: fromUci, to: toUci });
        const aiSan = chess.history().pop() || '';
        addMove(aiSan);
        afterMove();
      }
    } catch (eUnknown) {
      setError('AI error: ' + (eUnknown instanceof Error ? eUnknown.message : String(eUnknown)));
    } finally {
      setAIThinking(false);
    }
  }, [chess, aiLevel, setAIThinking, setLastMove, addMove, afterMove]);

  const handleSquareClick = useCallback(
    (squareInput: string) => {
      if (isAIThinking || gameOver) return;
      if (chess.turn() !== playerColor) return;

      if (!selectedSquare) {
        const piece = chess.get(squareInput as Square);
        if (piece && piece.color === playerColor) {
          selectSquare(squareInput);
          const moves = chess.moves({ square: squareInput as Square, verbose: true });
          setLegalMoves(moves.map((m) => m.to));
        }
        return;
      }

      if (legalMoves.includes(squareInput)) {
        try {
          chess.move({
            from: selectedSquare as Square,
            to: squareInput as Square,
          });
          setLastMove({ from: selectedSquare, to: squareInput });
          const san = chess.history().pop() || '';
          addMove(san);
          setError(null);
          afterMove();

          if (!chess.isGameOver()) {
            doAIMove();
          }
        } catch {
          setError('Invalid move');
        }
      }

      selectSquare(null);
      setLegalMoves([]);
    },
    [
      selectedSquare, legalMoves, isAIThinking, gameOver,
      playerColor, chess,
      selectSquare, setLegalMoves, setLastMove, addMove,
      afterMove, doAIMove,
    ],
  );

  const handleNewGame = useCallback(() => {
    chess.reset();
    setLocalStatus('active');
    setStatus('active');
    setError(null);
    resetGame();
  }, [chess, resetGame, setStatus]);

  const handleResign = useCallback(() => {
    setLocalStatus('checkmate');
    setStatus('checkmate');
    setGameOver(true, playerColor === 'w' ? 'black' : 'white');
  }, [playerColor, setGameOver, setStatus]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-amber-400">♚</span> AI Chess
        </h1>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400">Niveau:</label>
          <select
            value={aiLevel}
            onChange={(e) => setAiLevel(Number(e.currentTarget.value))}
            disabled={isAIThinking}
            className="bg-white/10 text-white text-xs rounded-lg px-2 py-1.5 border border-white/10"
          >
            {AI_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* 3D Board */}
      <div className="fixed inset-0 pt-14 pb-2 px-2">
        <BoardScene
          fen={chess.fen()}
          onSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          flipped={boardFlipped}
        />
      </div>

      {/* HUD Overlay */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <GameHUD
          whiteName={playerColor === 'w' ? 'You' : 'AI'}
          blackName={playerColor === 'w' ? 'AI' : 'You'}
          whiteElo={playerColor === 'w' ? 1500 : 1200 + aiLevel * 100}
          blackElo={playerColor === 'w' ? 1200 + aiLevel * 100 : 1500}
          whiteTimeMs={600000}
          blackTimeMs={600000}
          activeColor={chess.turn() === 'w' ? 'w' : 'b'}
          status={status}
          moves={moveHistory}
          winner={
            gameOver && chess.isCheckmate()
              ? (chess.turn() === 'w' ? 'Black' : 'White')
              : undefined
          }
          endReason={
            gameOver
              ? chess.isCheckmate()
                ? 'checkmate'
                : chess.isStalemate()
                  ? 'stalemate'
                  : 'draw'
              : undefined
          }
          onResign={handleResign}
          onDrawOffer={() => {}}
          onFlipBoard={flipBoard}
          onNewGame={handleNewGame}
          drawOffered={false}
        />
      </div>

      {/* AI Thinking indicator */}
      {isAIThinking && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm text-gray-300">AI réfléchit...</span>
          </div>
        </div>
      )}
    </main>
  );
}

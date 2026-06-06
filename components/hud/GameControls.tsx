'use client';

import type { GameStatus } from '@/lib/chess/types';

interface GameControlsProps {
  status: GameStatus;
  onResign: () => void;
  onDrawOffer: () => void;
  onFlipBoard: () => void;
  onNewGame: () => void;
  drawOffered?: boolean;
}

export default function GameControls({
  status,

  onResign,
  onDrawOffer,
  onFlipBoard,
  onNewGame,
  drawOffered = false,
}: GameControlsProps) {
  const isGameOver = status === 'checkmate' || status === 'stalemate' || status === 'draw';

  if (isGameOver) {
    return (
      <div className="flex gap-2">
        <button
          onClick={onNewGame}
          className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold
                     rounded-lg transition-all text-sm"
        >
          Nouvelle Partie
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onResign}
        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400
                   border border-red-500/20 rounded-lg text-xs transition-all"
      >
        Abandonner
      </button>

      <button
        onClick={onDrawOffer}
        className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
          drawOffered
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
        }`}
      >
        {drawOffered ? 'Nulle proposée...' : 'Proposer Nulle'}
      </button>

      <button
        onClick={onFlipBoard}
        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400
                   border border-white/10 rounded-lg text-xs transition-all"
      >
        Retourner
      </button>
    </div>
  );
}

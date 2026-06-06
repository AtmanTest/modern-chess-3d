'use client';

import PlayerCard from './PlayerCard';
import MoveHistory from './MoveHistory';
import GameStatusBadge from './GameStatus';
import GameControls from './GameControls';
import type { GameStatus, Color } from '@/lib/chess/types';

interface GameHUDProps {
  whiteName: string;
  blackName: string;
  whiteElo: number;
  blackElo: number;
  whiteTimeMs: number;
  blackTimeMs: number;
  activeColor: Color;
  status: GameStatus;
  moves: string[];
  winner?: string | null;
  endReason?: string | null;
  drawOffered?: boolean;
  onResign: () => void;
  onDrawOffer: () => void;
  onFlipBoard: () => void;
  onNewGame: () => void;
  currentMoveIndex?: number;
  onMoveClick?: (index: number) => void;
}

export default function GameHUD({
  whiteName,
  blackName,
  whiteElo,
  blackElo,
  whiteTimeMs,
  blackTimeMs,
  activeColor,
  status,
  moves,
  winner,
  endReason,
  drawOffered,
  onResign,
  onDrawOffer,
  onFlipBoard,
  onNewGame,
  currentMoveIndex,
  onMoveClick,
}: GameHUDProps) {
  return (
    <div className="absolute top-0 right-0 bottom-0 w-72 p-4 flex flex-col gap-3 pointer-events-auto z-10">
      {/* Black player (top) */}
      <PlayerCard
        name={blackName}
        elo={blackElo}
        color="b"
        timeMs={blackTimeMs}
        isActive={activeColor === 'b'}
      />

      {/* Game status */}
      <GameStatusBadge
        status={status}
        turn={activeColor}
        winner={winner}
        endReason={endReason}
      />

      {/* White player (bottom) */}
      <PlayerCard
        name={whiteName}
        elo={whiteElo}
        color="w"
        timeMs={whiteTimeMs}
        isActive={activeColor === 'w'}
      />

      {/* Move history */}
      <div className="flex-1 min-h-0">
        <MoveHistory
          moves={moves}
          currentMoveIndex={currentMoveIndex}
          onMoveClick={onMoveClick}
        />
      </div>

      {/* Controls */}
      <GameControls
        status={status}
        onResign={onResign}
        onDrawOffer={onDrawOffer}
        onFlipBoard={onFlipBoard}
        onNewGame={onNewGame}
        drawOffered={drawOffered}
      />
    </div>
  );
}

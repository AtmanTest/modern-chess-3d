'use client';

import type { GameStatus } from '@/lib/chess/types';

interface GameStatusProps {
  status: GameStatus;
  turn: 'w' | 'b';
  winner?: string | null;
  endReason?: string | null;
}

export default function GameStatusBadge({ status, turn, winner, endReason }: GameStatusProps) {
  const configs: Record<string, { text: string; color: string }> = {
    active: {
      text: turn === 'w' ? 'Aux Blancs de jouer' : 'Aux Noirs de jouer',
      color: 'text-gray-300',
    },
    check: {
      text: turn === 'w' ? 'Échec aux Blancs !' : 'Échec aux Noirs !',
      color: 'text-red-400',
    },
    checkmate: {
      text: winner ? `Victoire de ${winner} !` : 'Échec et Mat !',
      color: 'text-amber-400',
    },
    stalemate: {
      text: 'Pat ! Partie nulle.',
      color: 'text-yellow-400',
    },
    draw: {
      text: 'Partie nulle.',
      color: 'text-yellow-400',
    },
  };

  const config = configs[status] || configs.active;

  const endReasons: Record<string, string> = {
    resign: 'par abandon',
    timeout: 'par temps écoulé',
    draw_agreement: 'par accord mutuel',
    threefold_repetition: 'par répétition',
    insufficient_material: 'matériel insuffisant',
    fifty_moves: 'règle des 50 coups',
  };

  return (
    <div className="glass-panel px-4 py-2 text-center">
      <div className={`text-sm font-semibold ${config.color}`}>
        {config.text}
      </div>
      {endReason && endReasons[endReason] && (
        <div className="text-xs text-gray-500 mt-0.5">
          {endReasons[endReason]}
        </div>
      )}
    </div>
  );
}

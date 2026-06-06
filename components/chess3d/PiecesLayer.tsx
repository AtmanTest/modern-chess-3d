'use client';

import { useMemo } from 'react';
import ChessPiece3D from './ChessPiece3D';
import type { PieceType, Color } from '@/lib/chess/types';

interface PiecesLayerProps {
  fen: string;
  selectedSquare?: string | null;
  flipped?: boolean;
}

interface PiecePosition {
  type: PieceType;
  color: Color;
  square: string;
  x: number;
  z: number;
}

function fenToPositions(fen: string): PiecePosition[] {
  const positions: PiecePosition[] = [];
  const rows = fen.split(' ')[0].split('/');

  for (let row = 0; row < 8; row++) {
    let col = 0;
    for (const ch of rows[row]) {
      if (ch >= '1' && ch <= '8') {
        col += parseInt(ch);
      } else {
        const type = ch.toLowerCase() as PieceType;
        const color: Color = ch === ch.toUpperCase() ? 'w' : 'b';
        const file = col;
        const rank = 7 - row;
        const square = `${String.fromCharCode(97 + file)}${rank + 1}`;
        // Board center is at (0, 0, 0) with squares from -3.5 to 3.5
        const x = file - 3.5;
        const z = rank - 3.5;
        positions.push({ type, color, square, x, z });
        col++;
      }
    }
  }

  return positions;
}

export default function PiecesLayer({ fen, selectedSquare, flipped = false }: PiecesLayerProps) {
  const pieces = useMemo(() => {
    const positions = fenToPositions(fen);
    if (flipped) {
      return positions.map((p) => ({
        ...p,
        x: -p.x,
        z: -p.z,
      }));
    }
    return positions;
  }, [fen, flipped]);

  return (
    <group>
      {pieces.map((piece) => (
        <ChessPiece3D
          key={`${piece.square}-${piece.type}${piece.color}`}
          type={piece.type}
          color={piece.color}
          position={[piece.x, 0.15, piece.z]}
          isSelected={piece.square === selectedSquare}
        />
      ))}
    </group>
  );
}

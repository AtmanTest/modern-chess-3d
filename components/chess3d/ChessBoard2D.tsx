'use client';

import { useMemo } from 'react';
import { fenToPositionMap } from '@/lib/chess/notation';
import { BOARD_THEME, getPieceUnicode } from '@/lib/chess/utils';
import type { Color, PieceType } from '@/lib/chess/types';

interface ChessBoard2DProps {
  fen: string;
  flipped?: boolean;
  selectedSquare?: string | null;
  legalMoves?: string[];
  lastMove?: { from: string; to: string } | null;
  onSquareClick?: (square: string) => void;
}

export default function ChessBoard2D({
  fen,
  flipped = false,
  selectedSquare,
  legalMoves = [],
  lastMove,
  onSquareClick,
}: ChessBoard2DProps) {
  const positions = useMemo(() => fenToPositionMap(fen), [fen]);

  const squares = useMemo(() => {
    const result: { name: string; x: number; y: number; isLight: boolean; piece: string | null }[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const file = flipped ? 7 - col : col;
        const rank = flipped ? row + 1 : 8 - row;
        const name = `${String.fromCharCode(97 + file)}${rank}`;
        const isLight = (row + col) % 2 === 0;
        const pieceChar = positions.get(name);
        let piece: string | null = null;
        if (pieceChar) {
          const color: Color = pieceChar === pieceChar.toUpperCase() ? 'w' : 'b';
          const type = pieceChar.toLowerCase() as PieceType;
          piece = getPieceUnicode(type, color);
        }
        result.push({ name, x: col, y: row, isLight, piece });
      }
    }
    return result;
  }, [positions, flipped]);

  const squareSize = 62;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        width: squareSize * 8 + 2,
        height: squareSize * 8 + 2,
        border: '1px solid #333',
      }}
    >
      {squares.map((sq) => {
        const isSelected = sq.name === selectedSquare;
        const isLegal = legalMoves.includes(sq.name);
        const isLastMove = lastMove?.from === sq.name || lastMove?.to === sq.name;

        let bg = sq.isLight ? BOARD_THEME.lightPremium : BOARD_THEME.darkPremium;
        if (isSelected) bg = '#7fc97f';
        if (isLastMove && !isSelected) bg = '#eedd88';
        if (isLegal && !isSelected && !isLastMove) bg = sq.isLight ? '#b0ddb0' : '#7fc97f';

        return (
          <div
            key={sq.name}
            onClick={() => onSquareClick?.(sq.name)}
            style={{
              width: squareSize,
              height: squareSize,
              backgroundColor: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: sq.piece ? 36 : 14,
              cursor: 'pointer',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            {sq.piece && (
              <span
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  lineHeight: 1,
                }}
              >
                {sq.piece}
              </span>
            )}
            {isLegal && !sq.piece && (
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

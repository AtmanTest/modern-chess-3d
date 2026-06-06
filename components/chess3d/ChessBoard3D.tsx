'use client';

import { useMemo } from 'react';


interface ChessBoard3DProps {
  selectedSquare?: string | null;
  legalMoves?: string[];
  lastMove?: { from: string; to: string } | null;
}

export default function ChessBoard3D({
  selectedSquare,
  legalMoves = [],
  lastMove,
}: ChessBoard3DProps) {

  const squares = useMemo(() => {
    const result: {
      pos: [number, number];
      name: string;
      isSelected: boolean;
      isLegal: boolean;
      isLastMove: boolean;
    }[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const x = col - 3.5;
        const z = row - 3.5;
        const name = `${String.fromCharCode(97 + col)}${8 - row}`;

        result.push({
          pos: [x, z] as [number, number],
          name,
          isSelected: name === selectedSquare,
          isLegal: legalMoves.includes(name),
          isLastMove: lastMove?.from === name || lastMove?.to === name,
        });
      }
    }

    return result;
  }, [selectedSquare, legalMoves, lastMove]);

  return (
    <group>
      {squares.map((sq) => (
        <Square3D key={sq.name} {...sq} />
      ))}
    </group>
  );
}

function Square3D({
  pos,
  name,
  isSelected,
  isLegal,
  isLastMove,
}: {
  pos: [number, number];
  name: string;
  isSelected: boolean;
  isLegal: boolean;
  isLastMove: boolean;
}) {
  const colors = useMemo(() => {
    const lightColor = '#e8d5a3';
    const darkColor = '#a67c52';
    const isLight = (parseInt(name[1]) - 1 + (name.charCodeAt(0) - 97)) % 2 === 0;
    const base = isLight ? lightColor : darkColor;

    if (isSelected) return '#7fc97f';
    if (isLegal) return '#7fc97f';
    if (isLastMove) return '#eedd88';
    return base;
  }, [name, isSelected, isLegal, isLastMove]);

  return (
    <mesh position={[pos[0], -0.05, pos[1]]} receiveShadow>
      <boxGeometry args={[0.98, 0.08, 0.98]} />
      <meshStandardMaterial color={colors} roughness={0.7} metalness={0.2} />
    </mesh>
  );
}

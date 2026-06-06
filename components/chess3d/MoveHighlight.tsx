'use client';

import { useMemo } from 'react';

interface MoveHighlightProps {
  legalMoves: string[];
  lastMove?: { from: string; to: string } | null;
  checkSquare?: string | null;
  squareSize?: number;
}

export default function MoveHighlight({
  legalMoves,
  lastMove,
  checkSquare,
  
}: MoveHighlightProps) {
  const legalDots = useMemo(() => {
    return legalMoves.map((sq) => {
      const file = sq.charCodeAt(0) - 97;
      const rank = parseInt(sq[1]) - 1;
      const x = file - 3.5;
      const z = rank - 3.5;
      return { x, z, square: sq };
    });
  }, [legalMoves]);

  const checkPos = useMemo(() => {
    if (!checkSquare) return null;
    const file = checkSquare.charCodeAt(0) - 97;
    const rank = parseInt(checkSquare[1]) - 1;
    return { x: file - 3.5, z: rank - 3.5 };
  }, [checkSquare]);

  return (
    <group>
      {/* Legal move dots */}
      {legalDots.map((dot) => (
        <mesh
          key={dot.square}
          position={[dot.x, 0.02, dot.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.15, 16]} />
          <meshBasicMaterial color="#7fc97f" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Last move highlight */}
      {lastMove && (
        <group>
          {[lastMove.from, lastMove.to].map((sq) => {
            if (!sq) return null;
            const file = sq.charCodeAt(0) - 97;
            const rank = parseInt(sq[1]) - 1;
            const x = file - 3.5;
            const z = rank - 3.5;
            return (
              <mesh
                key={`lm-${sq}`}
                position={[x, 0.01, z]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[0.9, 0.9]} />
                <meshBasicMaterial
                  color="#ffff8f"
                  transparent
                  opacity={0.3}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Check highlight */}
      {checkPos && (
        <mesh
          position={[checkPos.x, 0.02, checkPos.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.2, 0.4, 16]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

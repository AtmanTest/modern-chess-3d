'use client';

import { useSpring, animated } from '@react-spring/three';
import ChessPiece3D from './ChessPiece3D';
import type { PieceType, Color } from '@/lib/chess/types';

interface AnimatedPieceProps {
  type: PieceType;
  color: Color;
  fromPos: [number, number, number];
  toPos: [number, number, number];
  onComplete?: () => void;
}

export default function AnimatedPiece({
  type,
  color,
  fromPos,
  toPos,
  onComplete,
}: AnimatedPieceProps) {

  const { position } = useSpring({
    from: { position: fromPos },
    to: async (next) => {
      const midPos: [number, number, number] = [
        (fromPos[0] + toPos[0]) / 2,
        fromPos[1] + 1.5,
        (fromPos[2] + toPos[2]) / 2,
      ];
      await next({ position: midPos });
      await next({ position: toPos });
    },
    config: { mass: 1, tension: 180, friction: 20 },
    onRest: () => onComplete?.(),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AnimatedGroup = animated.group as any;

  return (
    <AnimatedGroup  position={position}>
      <ChessPiece3D type={type} color={color} position={[0, 0, 0]} />
    </AnimatedGroup>
  );
}

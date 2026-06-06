'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';

// Lazy-loaded 3D components
const ChessBoard3D = dynamic(() => import('./ChessBoard3D'), { ssr: false });
const PiecesLayer = dynamic(() => import('./PiecesLayer'), { ssr: false });
const CameraController = dynamic(() => import('./CameraController'), { ssr: false });
const MoveHighlight = dynamic(() => import('./MoveHighlight'), { ssr: false });
const Lights = dynamic(() => import('./Lights'), { ssr: false });

interface BoardSceneProps {
  fen: string;
  selectedSquare?: string | null;
  legalMoves?: string[];
  lastMove?: { from: string; to: string } | null;
  checkSquare?: string | null;
  flipped?: boolean;
  onSquareClick?: (square: string) => void;
}

export default function BoardScene({
  fen,
  selectedSquare,
  legalMoves = [],
  lastMove,
  checkSquare,
  flipped = false,
  onSquareClick,
}: BoardSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 8, 8], fov: 40, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: 3, // ACESFilmic
          outputColorSpace: 'srgb',
        }}
        style={{ background: '#0a0a0a' }}
      >
        <Suspense fallback={null}>
          <Lights />
          <ChessBoard3D
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            onSquareClick={onSquareClick}
          />
          <PiecesLayer
            fen={fen}
            selectedSquare={selectedSquare}
            flipped={flipped}
          />
          <MoveHighlight
            legalMoves={legalMoves}
            lastMove={lastMove}
            checkSquare={checkSquare}
          />
          <CameraController initialPosition={[0, 8, 8]} />
        </Suspense>
      </Canvas>
    </div>
  );
}

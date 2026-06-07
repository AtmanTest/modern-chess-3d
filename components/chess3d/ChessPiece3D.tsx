'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { PieceType, Color } from '@/lib/chess/types';

interface ChessPiece3DProps {
  type: PieceType;
  color: Color;
  position: [number, number, number];
  isSelected?: boolean;
}

export default function ChessPiece3D({
  type,
  color,
  position,
  isSelected = false,
}: ChessPiece3DProps) {
  const baseY = position[1];
  const liftedY = isSelected ? baseY + 0.3 : baseY;
  const materialColor = color === 'w' ? '#f5f0e8' : '#1a1a1a';

  const meshes = useMemo(() => createPieceMeshes(type), [type]);

  return (
    <group
      position={[position[0], liftedY, position[2]]}
      castShadow
      rotation={[0, 0, 0]}
    >
      {meshes.map((m, i) => (
        <mesh
          key={i}
          geometry={m.geometry}
          position={m.position}
          rotation={m.rotation}
        >
          <meshStandardMaterial
            color={materialColor}
            roughness={color === 'w' ? 0.25 : 0.35}
            metalness={color === 'w' ? 0.6 : 0.4}
            emissive={isSelected ? '#4fc3f7' : '#000000'}
            emissiveIntensity={isSelected ? 0.15 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

interface PieceMesh {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
}

function createPieceMeshes(type: PieceType): PieceMesh[] {
  const meshes: PieceMesh[] = [];

  // All pieces share a base cylinder
  meshes.push({
    geometry: new THREE.CylinderGeometry(0.28, 0.35, 0.08, 16),
    position: [0, 0.04, 0],
    rotation: [0, 0, 0],
  });
  // Middle column
  meshes.push({
    geometry: new THREE.CylinderGeometry(0.22, 0.28, 0.18, 16),
    position: [0, 0.18, 0],
    rotation: [0, 0, 0],
  });

  switch (type) {
    case 'p': // ♟ Pawn: small body + tiny head
      meshes.push({
        geometry: new THREE.CylinderGeometry(0.18, 0.24, 0.08, 16),
        position: [0, 0.28, 0],
        rotation: [0, 0, 0],
      });
      meshes.push({
        geometry: new THREE.SphereGeometry(0.1, 10, 10),
        position: [0, 0.38, 0],
        rotation: [0, 0, 0],
      });
      break;

    case 'n': // ♞ Knight: base + tall head
      meshes.push({
        geometry: new THREE.CylinderGeometry(0.2, 0.26, 0.1, 16),
        position: [0, 0.3, 0],
        rotation: [0, 0, 0],
      });
      // Horse head — tilted cone
      meshes.push({
        geometry: new THREE.ConeGeometry(0.16, 0.2, 8),
        position: [0.06, 0.45, 0.04],
        rotation: [0, 0, -0.3],
      });
      break;

    case 'b': // ♝ Bishop: tall body + mitre (pointed)
      meshes.push({
        geometry: new THREE.CylinderGeometry(0.15, 0.24, 0.22, 16),
        position: [0, 0.33, 0],
        rotation: [0, 0, 0],
      });
      // Mitre top
      meshes.push({
        geometry: new THREE.ConeGeometry(0.12, 0.12, 10),
        position: [0, 0.5, 0],
        rotation: [0, 0, 0],
      });
      // Small cross on top
      meshes.push({
        geometry: new THREE.SphereGeometry(0.04, 6, 6),
        position: [0, 0.58, 0],
        rotation: [0, 0, 0],
      });
      break;

    case 'r': // ♜ Rook: flat top with battlements
      meshes.push({
        geometry: new THREE.CylinderGeometry(0.18, 0.24, 0.14, 16),
        position: [0, 0.28, 0],
        rotation: [0, 0, 0],
      });
      // Top flat disc
      meshes.push({
        geometry: new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16),
        position: [0, 0.38, 0],
        rotation: [0, 0, 0],
      });
      // Battlements: 4 small cylinders on top
      const battlementPositions: [number, number, number][] = [
        [0.15, 0.43, 0],
        [-0.15, 0.43, 0],
        [0, 0.43, 0.15],
        [0, 0.43, -0.15],
      ];
      for (const bp of battlementPositions) {
        meshes.push({
          geometry: new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6),
          position: bp,
          rotation: [0, 0, 0],
        });
      }
      break;

    case 'q': // ♛ Queen: tall elegant
      meshes.push({
        geometry: new THREE.CylinderGeometry(0.18, 0.26, 0.14, 16),
        position: [0, 0.28, 0],
        rotation: [0, 0, 0],
      });
      // Crown base
      meshes.push({
        geometry: new THREE.SphereGeometry(0.16, 12, 12),
        position: [0, 0.42, 0],
        rotation: [0, 0, 0],
      });
      // Small crown spikes
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        meshes.push({
          geometry: new THREE.ConeGeometry(0.04, 0.1, 6),
          position: [Math.sin(angle) * 0.14, 0.5, Math.cos(angle) * 0.14],
          rotation: [0, 0, Math.PI / 6],
        });
      }
      // Top ball
      meshes.push({
        geometry: new THREE.SphereGeometry(0.06, 8, 8),
        position: [0, 0.53, 0],
        rotation: [0, 0, 0],
      });
      break;

    case 'k': // ♚ King: tallest, cross on top
      meshes.push({
        geometry: new THREE.CylinderGeometry(0.22, 0.3, 0.18, 16),
        position: [0, 0.28, 0],
        rotation: [0, 0, 0],
      });
      // Larger sphere
      meshes.push({
        geometry: new THREE.SphereGeometry(0.2, 12, 12),
        position: [0, 0.45, 0],
        rotation: [0, 0, 0],
      });
      // Cross on top — vertical bar
      meshes.push({
        geometry: new THREE.BoxGeometry(0.04, 0.18, 0.04),
        position: [0, 0.62, 0],
        rotation: [0, 0, 0],
      });
      // Cross bar
      meshes.push({
        geometry: new THREE.BoxGeometry(0.12, 0.04, 0.04),
        position: [0, 0.7, 0],
        rotation: [0, 0, 0],
      });
      break;
  }

  return meshes;
}

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

  const geometries = useMemo(() => createProceduralPiece(type), [type]);

  return (
    <group position={[position[0], liftedY, position[2]]} castShadow>
      {geometries.map((geom, i) => (
        <mesh key={i} geometry={geom.geometry} position={geom.position}>
          <meshStandardMaterial
            color={color === 'w' ? '#f0f0f0' : '#1a1a1a'}
            roughness={color === 'w' ? 0.3 : 0.4}
            metalness={color === 'w' ? 0.7 : 0.5}
            emissive={isSelected ? '#4fc3f7' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

function createProceduralPiece(type: PieceType) {
  const geometries: { geometry: THREE.BufferGeometry; position: [number, number, number] }[] = [];

  switch (type) {
    case 'p':
      geometries.push({ geometry: new THREE.CylinderGeometry(0.2, 0.25, 0.3, 12), position: [0, 0.15, 0] });
      geometries.push({ geometry: new THREE.SphereGeometry(0.12, 8, 8), position: [0, 0.37, 0] });
      break;
    case 'n':
      geometries.push({ geometry: new THREE.CylinderGeometry(0.22, 0.28, 0.35, 12), position: [0, 0.17, 0] });
      geometries.push({ geometry: new THREE.ConeGeometry(0.18, 0.2, 8), position: [0, 0.45, 0.05] });
      break;
    case 'b':
      geometries.push({ geometry: new THREE.CylinderGeometry(0.15, 0.28, 0.4, 12), position: [0, 0.2, 0] });
      geometries.push({ geometry: new THREE.SphereGeometry(0.13, 10, 10), position: [0, 0.45, 0] });
      break;
    case 'r':
      geometries.push({ geometry: new THREE.CylinderGeometry(0.24, 0.28, 0.35, 12), position: [0, 0.17, 0] });
      geometries.push({ geometry: new THREE.CylinderGeometry(0.2, 0.22, 0.1, 12), position: [0, 0.4, 0] });
      break;
    case 'q':
      geometries.push({ geometry: new THREE.CylinderGeometry(0.25, 0.32, 0.4, 12), position: [0, 0.2, 0] });
      geometries.push({ geometry: new THREE.SphereGeometry(0.2, 12, 12), position: [0, 0.5, 0] });
      break;
    case 'k':
      geometries.push({ geometry: new THREE.CylinderGeometry(0.28, 0.35, 0.4, 12), position: [0, 0.2, 0] });
      geometries.push({ geometry: new THREE.SphereGeometry(0.18, 12, 12), position: [0, 0.5, 0] });
      break;
  }

  return geometries;
}

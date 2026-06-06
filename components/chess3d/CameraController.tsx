'use client';

import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

interface CameraControllerProps {
  enablePan?: boolean;
  enableZoom?: boolean;
  minDistance?: number;
  maxDistance?: number;
  initialPosition?: [number, number, number];
}

export default function CameraController({
  enablePan = false,
  enableZoom = true,
  minDistance = 3,
  maxDistance = 15,
  initialPosition = [0, 8, 8],
}: CameraControllerProps) {
  const { camera } = useThree();

  // Set initial camera position
  camera.position.set(...initialPosition);
  camera.lookAt(0, 0, 0);

  return (
    <OrbitControls
      enablePan={enablePan}
      enableZoom={enableZoom}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2.1}
      target={[0, 0, 0]}
      dampingFactor={0.1}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
    />
  );
}

'use client';

export default function Lights({
  intensity = 1,
  shadowMapSize = 1024,
}: {
  intensity?: number;
  shadowMapSize?: number;
}) {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.3 * intensity} />

      {/* Main directional light (key light) */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.6 * intensity}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-bias={-0.001}
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={[-5, 5, -3]}
        intensity={0.3 * intensity}
      />

      {/* Back light for rim highlight */}
      <directionalLight
        position={[0, 3, -8]}
        intensity={0.2 * intensity}
      />

      {/* Hemisphere light for natural sky/ground gradient */}
      <hemisphereLight
        args={['#87ceeb', '#3a3a3a', 0.4]}
      />
    </>
  );
}

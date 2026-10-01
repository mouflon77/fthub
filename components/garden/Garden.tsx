'use client';

import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectQuality, prefersReducedMotion } from '@/lib/garden/quality';
import { CameraRig } from './CameraRig';
import { CircuitStage } from './CircuitStage';
import { Emblem } from './Emblem';
import { IceDome } from './IceDome';
import { Post } from './Post';
import { PulseDriver } from './PulseDriver';
import { Skyline } from './Skyline';

function FirstFrame({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) onReady();
  });
  return null;
}

export default function Garden({ onReady }: { onReady: () => void }) {
  const [{ quality, motion }] = useState(() => ({
    quality: detectQuality(),
    motion: prefersReducedMotion() ? 0.14 : 1,
  }));

  return (
    <div className="garden" aria-hidden="true">
      <Canvas
        dpr={quality.dpr}
        camera={{ fov: 42, near: 0.1, far: 220, position: [0, 1.55, 6.2] }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.02;
          gl.setClearColor('#f7f6f0');
        }}
      >
        <PulseDriver motion={motion} />
        <CameraRig />
        <IceDome />
        <Skyline count={quality.towers} />
        <Suspense fallback={null}>
          <Emblem />
        </Suspense>
        <CircuitStage
          nodes={quality.nodes}
          gears={quality.gears}
          pillars={quality.pillars}
          chips={quality.chips}
        />
        {quality.bloom ? <Post smaa={quality.smaa} /> : null}
        <FirstFrame onReady={onReady} />
      </Canvas>
    </div>
  );
}

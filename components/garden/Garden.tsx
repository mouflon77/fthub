'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectQuality, prefersReducedMotion } from '@/lib/garden/quality';
import { Backdrop } from './Backdrop';
import { Beams } from './Beams';
import { CameraRig } from './CameraRig';
import { Emblem } from './Emblem';
import { Fireflies } from './Fireflies';
import { Flowers } from './Flowers';
import { Grass } from './Grass';
import { Ground } from './Ground';
import { Post } from './Post';
import { WindDriver } from './WindDriver';

/** Lifts the loading curtain once there is something real behind it. */
function FirstFrame({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) onReady();
  });
  return null;
}

export default function Garden({ onReady }: { onReady: () => void }) {
  // This module is imported with `ssr: false`, so the real device is already
  // measurable on the first render and the tier is settled before anything is
  // built. Nothing here ever runs on the server.
  const [{ quality, motion }] = useState(() => ({
    quality: detectQuality(),
    motion: prefersReducedMotion() ? 0.14 : 1,
  }));

  return (
    <div className="garden" aria-hidden="true">
      <Canvas
        dpr={quality.dpr}
        camera={{ fov: 42, near: 0.1, far: 200, position: [0, 1.46, 5.6] }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <WindDriver motion={motion} />
        <CameraRig />
        <Backdrop />
        <Emblem />
        <Beams count={quality.beams} />
        <Ground />
        <Grass count={quality.grass} />
        <Flowers count={quality.flowers} />
        <Fireflies count={quality.fireflies} />
        {quality.bloom ? <Post smaa={quality.smaa} /> : null}
        <FirstFrame onReady={onReady} />
      </Canvas>
    </div>
  );
}

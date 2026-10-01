'use client';

import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { viewState } from '@/lib/circuit/state';

/**
 * The camera never zooms with the scroll wheel — scrolling belongs to the page.
 * It leans toward the cursor and pulls back as you read, so the board recedes
 * behind the copy rather than fighting it.
 *
 * On a portrait viewport a fixed vertical field of view crops the meadow away
 * and blows the emblem up, so the rig widens and steps back instead.
 */
export function CameraRig() {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  const wanted = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const aspect = size.width / Math.max(size.height, 1);
    const portrait = THREE.MathUtils.clamp(1.25 - aspect, 0, 0.85);

    const fov = 42 + portrait * 15;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const lift = Math.min(viewState.scroll, 1.5);
    const { x, y } = viewState.pointer;

    wanted.set(
      x * 0.44,
      1.7 + portrait * 0.4 + y * 0.12 + lift * 0.95,
      6.4 + portrait * 2.7 + lift * 1.9,
    );
    camera.position.lerp(wanted, 1 - Math.exp(-3.2 * dt));

    target.set(x * 0.18, 0.4 + lift * 0.55, -2.2);
    camera.lookAt(target);
  });

  return null;
}

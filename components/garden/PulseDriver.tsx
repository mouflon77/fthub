'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { circuitUniforms, pushPulse, viewState } from '@/lib/circuit/state';

const BOARD = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/**
 * Cursor over the page becomes a board pointer. Click fires a strong orange
 * pulse; steady movement sends quieter currents so the mesh feels live.
 */
export function PulseDriver({ motion }: { motion: number }) {
  const camera = useThree((state) => state.camera);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);

  const rawPointer = useRef(new THREE.Vector2(0, -0.25));
  const easedPointer = useRef(new THREE.Vector2(0, -0.25));
  const present = useRef(0);
  const aim = useRef(new THREE.Vector3(0, 0, 1.5));
  const smoothed = useRef(new THREE.Vector3(0, 0, 1.5));
  const lastPoint = useRef(new THREE.Vector3(0, 0, 1.5));
  const travel = useRef(0);
  const pulseQueued = useRef(false);
  const primed = useRef(false);
  const lastPulseAt = useRef(-10);

  useEffect(() => {
    circuitUniforms.uMotion.value = motion;
  }, [motion]);

  useEffect(() => {
    const track = (event: PointerEvent) => {
      rawPointer.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
      present.current = 1;
    };

    const onDown = (event: PointerEvent) => {
      track(event);
      pulseQueued.current = true;
    };

    const onRelease = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') present.current = 0;
    };

    const onLeave = () => {
      present.current = 0;
    };

    window.addEventListener('pointermove', track, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onRelease, { passive: true });
    window.addEventListener('pointercancel', onLeave, { passive: true });
    window.addEventListener('blur', onLeave);
    document.documentElement.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', track);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onRelease);
      window.removeEventListener('pointercancel', onLeave);
      window.removeEventListener('blur', onLeave);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(Math.max(delta, 1 / 240), 1 / 20);
    circuitUniforms.uTime.value += dt;

    easedPointer.current.lerp(rawPointer.current, 1 - Math.exp(-9 * dt));
    viewState.pointer.copy(easedPointer.current);

    raycaster.setFromCamera(easedPointer.current, camera);
    if (raycaster.ray.intersectPlane(BOARD, scratch)) {
      aim.current.set(
        THREE.MathUtils.clamp(scratch.x, -14, 14),
        0,
        THREE.MathUtils.clamp(scratch.z, -10, 10),
      );
    }

    if (!primed.current) {
      primed.current = true;
      smoothed.current.copy(aim.current);
      lastPoint.current.copy(aim.current);
      circuitUniforms.uPointer.value.copy(aim.current);
      return;
    }

    smoothed.current.lerp(aim.current, 1 - Math.exp(-7 * dt));
    circuitUniforms.uPointer.value.copy(smoothed.current);

    travel.current += smoothed.current.distanceTo(lastPoint.current);
    lastPoint.current.copy(smoothed.current);

    const amp = circuitUniforms.uPointerAmp;
    amp.value += (present.current - amp.value) * (1 - Math.exp(-3.2 * dt));

    if (pulseQueued.current) {
      pulseQueued.current = false;
      pushPulse(smoothed.current.x, smoothed.current.z, 1.4 * Math.max(motion, 0.2));
      lastPulseAt.current = circuitUniforms.uTime.value;
      travel.current = 0;
    } else if (
      motion > 0.4 &&
      present.current > 0.5 &&
      travel.current > 1.25 &&
      circuitUniforms.uTime.value - lastPulseAt.current > 0.7
    ) {
      pushPulse(smoothed.current.x, smoothed.current.z, 0.55 * motion);
      lastPulseAt.current = circuitUniforms.uTime.value;
      travel.current = 0;
    }
  });

  return null;
}

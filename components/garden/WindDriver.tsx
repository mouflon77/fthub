'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { pushGust, viewState, windUniforms } from '@/lib/garden/state';

const GROUND = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/**
 * Turns cursor movement into wind.
 *
 * The pointer is tracked on the window rather than through the canvas, so the
 * garden keeps responding while the cursor is over the copy layered on top of
 * it. Its ray is cast onto the ground plane, then run through a chain of
 * springs: an eased aim point, a fast velocity spring and a slow one. Blending
 * the two velocity springs in the shader is what gives the field its overshoot
 * and unhurried settle instead of a rigid one-to-one follow.
 */
export function WindDriver({ motion }: { motion: number }) {
  const camera = useThree((state) => state.camera);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const velocity = useMemo(() => new THREE.Vector2(), []);

  const rawPointer = useRef(new THREE.Vector2(0, -0.3));
  const easedPointer = useRef(new THREE.Vector2(0, -0.3));
  const present = useRef(0);
  const aim = useRef(new THREE.Vector3(0, 0, 1.5));
  const smoothed = useRef(new THREE.Vector3(0, 0, 1.5));
  const previous = useRef(new THREE.Vector3(0, 0, 1.5));
  const gustQueued = useRef(false);
  const primed = useRef(false);

  useEffect(() => {
    windUniforms.uMotion.value = motion;
    windUniforms.uBreeze.value = 0.34 * motion;
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
      gustQueued.current = true;
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
    // THREE.Clock hands back exactly 0 on its first tick. Everything below
    // divides by dt, so a floor here is what keeps the springs finite — one
    // NaN would latch into the stroke uniforms and flatten the whole garden.
    const dt = Math.min(Math.max(delta, 1 / 240), 1 / 20);
    windUniforms.uTime.value += dt;

    easedPointer.current.lerp(rawPointer.current, 1 - Math.exp(-9 * dt));
    viewState.pointer.copy(easedPointer.current);

    raycaster.setFromCamera(easedPointer.current, camera);
    if (raycaster.ray.intersectPlane(GROUND, scratch)) {
      aim.current.set(
        THREE.MathUtils.clamp(scratch.x, -20, 20),
        0,
        THREE.MathUtils.clamp(scratch.z, -20, 20),
      );
    }

    // Snap to the opening aim rather than measuring a velocity across it.
    if (!primed.current) {
      primed.current = true;
      smoothed.current.copy(aim.current);
      previous.current.copy(aim.current);
      windUniforms.uPointer.value.copy(aim.current);
      return;
    }

    previous.current.copy(smoothed.current);
    smoothed.current.lerp(aim.current, 1 - Math.exp(-7 * dt));
    windUniforms.uPointer.value.copy(smoothed.current);

    velocity
      .set((smoothed.current.x - previous.current.x) / dt, (smoothed.current.z - previous.current.z) / dt)
      .clampLength(0, 9);

    windUniforms.uStroke.value.lerp(velocity, 1 - Math.exp(-6 * dt)).clampLength(0, 2.0);
    windUniforms.uStrokeSlow.value.lerp(windUniforms.uStroke.value, 1 - Math.exp(-1.6 * dt));

    const amp = windUniforms.uPointerAmp;
    amp.value += (present.current - amp.value) * (1 - Math.exp(-3.5 * dt));

    if (gustQueued.current) {
      gustQueued.current = false;
      pushGust(smoothed.current.x, smoothed.current.z, 2.2 * motion);
    }
  });

  return null;
}

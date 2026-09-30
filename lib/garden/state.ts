import * as THREE from 'three';
import { FT_GUST_SLOTS } from '../glsl/wind';

/**
 * One set of uniform objects, shared by reference across every material in the
 * garden. Whatever drives these drives the flowers, the grass, the fireflies
 * and the ground ripples at the same instant.
 */
export const windUniforms = {
  uTime: { value: 0 },
  uPointer: { value: new THREE.Vector3(0, 0, 2) },
  uPointerAmp: { value: 0 },
  uStroke: { value: new THREE.Vector2() },
  uStrokeSlow: { value: new THREE.Vector2() },
  uBreeze: { value: 0.34 },
  uMotion: { value: 1 },
  uReach: { value: 7.5 },
  uGusts: {
    value: Array.from({ length: FT_GUST_SLOTS }, () => new THREE.Vector4(0, 0, 0, -1)),
  },
};

let gustSlot = 0;

export function pushGust(x: number, z: number, strength = 2.4) {
  const gust = windUniforms.uGusts.value[gustSlot];
  gust.set(x, z, strength, windUniforms.uTime.value);
  gustSlot = (gustSlot + 1) % FT_GUST_SLOTS;
}

/** Read by the camera rig and the emblem. Written by the wind driver. */
export const viewState = {
  /** Scroll position in viewport heights. */
  scroll: 0,
  /** Pointer in normalised device coordinates, smoothed. */
  pointer: new THREE.Vector2(0, 0),
};

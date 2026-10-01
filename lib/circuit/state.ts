import * as THREE from 'three';
import { brand, hexToRgb } from '@/lib/brand';

const [iceR, iceG, iceB] = hexToRgb(brand.ice);
const [circuitR, circuitG, circuitB] = hexToRgb(brand.circuit);
const [pulseR, pulseG, pulseB] = hexToRgb(brand.pulse);

/**
 * Shared uniforms for the kinetic PCB scene. Pointer and pulse travel live here
 * so traces, nodes and the mist all agree on the same clock.
 */
export const circuitUniforms = {
  uTime: { value: 0 },
  uMotion: { value: 1 },
  uPointer: { value: new THREE.Vector3(0, 0, 1.5) },
  uPointerAmp: { value: 0 },
  uPulseOrigin: { value: new THREE.Vector3(0, 0, 1.5) },
  uPulseStart: { value: -10 },
  uPulseStrength: { value: 0 },
  uIce: { value: new THREE.Color(iceR, iceG, iceB) },
  uCircuit: { value: new THREE.Color(circuitR, circuitG, circuitB) },
  uPulse: { value: new THREE.Color(pulseR, pulseG, pulseB) },
};

const PULSE_SLOTS = 5;

export const pulseSlots = {
  origins: Array.from({ length: PULSE_SLOTS }, () => new THREE.Vector3()),
  starts: new Float32Array(PULSE_SLOTS).fill(-10),
  strengths: new Float32Array(PULSE_SLOTS).fill(0),
};

let pulseCursor = 0;

export function pushPulse(x: number, z: number, strength = 1) {
  const i = pulseCursor;
  pulseSlots.origins[i].set(x, 0, z);
  pulseSlots.starts[i] = circuitUniforms.uTime.value;
  pulseSlots.strengths[i] = strength;
  pulseCursor = (pulseCursor + 1) % PULSE_SLOTS;

  // Latest pulse also drives the single-slot uniforms for simple materials.
  circuitUniforms.uPulseOrigin.value.set(x, 0, z);
  circuitUniforms.uPulseStart.value = circuitUniforms.uTime.value;
  circuitUniforms.uPulseStrength.value = strength;
}

export const viewState = {
  scroll: 0,
  pointer: new THREE.Vector2(0, 0),
};

'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildTraceGeometry, type CircuitEdge } from '@/lib/circuit/network';
import { circuitUniforms, pulseSlots } from '@/lib/circuit/state';

const PULSE_SLOTS = 5;

const vertexShader = /* glsl */ `
attribute float aAlong;
varying float vAlong;
varying vec3 vWorld;

void main() {
  vAlong = aAlong;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
#define PULSES ${PULSE_SLOTS}

uniform float uTime;
uniform float uMotion;
uniform vec3 uCircuit;
uniform vec3 uPulse;
uniform vec3 uPulseOrigins[PULSES];
uniform float uPulseStarts[PULSES];
uniform float uPulseStrengths[PULSES];
uniform vec3 uPointer;
uniform float uPointerAmp;

varying float vAlong;
varying vec3 vWorld;

void main() {
  vec3 col = uCircuit * 0.82;
  float alpha = 0.55;

  // Idle shimmer: a slow data current so the board never looks dead.
  float idle = 0.5 + 0.5 * sin(vAlong * 1.7 - uTime * 1.15 * uMotion);
  col += uCircuit * idle * 0.18;
  alpha += idle * 0.08;

  // Soft proximity glow under the cursor.
  float near = exp(-length(vWorld.xz - uPointer.xz) * 1.8);
  col = mix(col, uPulse, near * uPointerAmp * 0.35);
  alpha += near * uPointerAmp * 0.2;

  for (int i = 0; i < PULSES; i++) {
    float start = uPulseStarts[i];
    float strength = uPulseStrengths[i];
    if (strength < 0.01 || start < 0.0) continue;
    float age = uTime - start;
    if (age < 0.0 || age > 2.6) continue;

    float radius = age * 4.8;
    float dist = length(vWorld.xz - uPulseOrigins[i].xz);
    float ring = exp(-pow((dist - radius) * 3.4, 2.0));
    float fade = exp(-age * 1.15) * strength;
    col = mix(col, uPulse, clamp(ring * fade * 1.4, 0.0, 1.0));
      col += uPulse * ring * fade * 2.2;
    alpha += ring * fade * 0.55;
  }

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
}
`;

export function Traces({ edges }: { edges: CircuitEdge[] }) {
  const geometry = useMemo(() => buildTraceGeometry(edges), [edges]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: circuitUniforms.uTime,
        uMotion: circuitUniforms.uMotion,
        uCircuit: circuitUniforms.uCircuit,
        uPulse: circuitUniforms.uPulse,
        uPulseOrigins: { value: pulseSlots.origins },
        uPulseStarts: { value: pulseSlots.starts },
        uPulseStrengths: { value: pulseSlots.strengths },
        uPointer: circuitUniforms.uPointer,
        uPointerAmp: circuitUniforms.uPointerAmp,
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame(() => {
    // Keep typed array uniforms dirty for WebGL.
    material.uniforms.uPulseStarts.value = pulseSlots.starts;
    material.uniforms.uPulseStrengths.value = pulseSlots.strengths;
  });

  return <mesh geometry={geometry} material={material} renderOrder={2} />;
}

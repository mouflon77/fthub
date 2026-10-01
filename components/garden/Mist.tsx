'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { noiseGLSL } from '@/lib/glsl/noise';
import { circuitUniforms } from '@/lib/circuit/state';

const vertexShader = /* glsl */ `
varying vec3 vWorld;
varying vec2 vUv;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
${noiseGLSL}

uniform float uTime;
uniform vec3 uIce;
uniform vec3 uCircuit;

varying vec3 vWorld;
varying vec2 vUv;

void main() {
  vec3 col = uIce;

  // Soft volumetric mist, denser toward the horizon of the board.
  float mist = snoise(vec3(vWorld.xz * 0.08, uTime * 0.015)) * 0.5 + 0.5;
  col = mix(col, vec3(0.96, 0.98, 1.0), mist * 0.35);
  col = mix(col, vec3(0.78, 0.88, 0.95), smoothstep(4.0, 16.0, length(vWorld.xz)) * 0.28);

  // Micro grid coordinates: fine, barely-there engineering marks.
  vec2 grid = abs(fract(vWorld.xz * 1.35) - 0.5);
  float line = 1.0 - smoothstep(0.0, 0.02, min(grid.x, grid.y));
  vec2 majorGrid = abs(fract(vWorld.xz * 0.27) - 0.5);
  float major = 1.0 - smoothstep(0.0, 0.03, min(majorGrid.x, majorGrid.y));
  col = mix(col, mix(uCircuit, vec3(1.0), 0.55), line * 0.045 + major * 0.035);

  // Keep the typography corridor quieter.
  float clear = smoothstep(5.5, 2.2, length(vWorld.xz * vec2(1.0, 0.85)));
  col = mix(col, uIce * 1.03, clear * 0.55);

  col += (ftHash(gl_FragCoord.xy) - 0.5) * 0.008;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Ice mist ground plane with a faint PCB grid. */
export function Mist() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: circuitUniforms.uTime,
          uIce: circuitUniforms.uIce,
          uCircuit: circuitUniforms.uCircuit,
        },
        depthWrite: true,
      }),
    [],
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={material} frustumCulled={false}>
      <planeGeometry args={[48, 48, 1, 1]} />
    </mesh>
  );
}

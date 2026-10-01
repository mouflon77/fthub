'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { circuitUniforms } from '@/lib/circuit/state';

const vertexShader = /* glsl */ `
varying vec3 vWorld;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uIce;
varying vec3 vWorld;

void main() {
  vec3 dir = normalize(vWorld - cameraPosition);
  float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 zenith = mix(uIce, vec3(0.99, 0.99, 0.96), 0.55);
  vec3 horizon = mix(uIce, vec3(0.78, 0.84, 0.72), 0.35);
  vec3 col = mix(horizon, zenith, smoothstep(0.2, 0.9, h));
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Soft ice dome so the board never meets a hard void. */
export function IceDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uIce: circuitUniforms.uIce },
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  return (
    <mesh material={material} renderOrder={-20} frustumCulled={false}>
      <sphereGeometry args={[60, 24, 16]} />
    </mesh>
  );
}

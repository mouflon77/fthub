'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { noiseGLSL } from '@/lib/glsl/noise';
import { skyGLSL } from '@/lib/glsl/sky';
import { windUniforms } from '@/lib/garden/state';

const vertexShader = /* glsl */ `
varying vec3 vWorld;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
${noiseGLSL}
${skyGLSL}

uniform float uTime;
varying vec3 vWorld;

void main() {
  vec3 dir = normalize(vWorld - cameraPosition);
  vec3 col = ftSky(dir);

  // Slow drifting haze that thickens toward the horizon.
  float haze = snoise(vec3(dir.x * 2.4, dir.z * 2.4, uTime * 0.02)) * 0.5 + 0.5;
  col += vec3(0.014, 0.048, 0.10) * haze * smoothstep(0.55, 0.0, abs(dir.y));

  // A dust of faint specks so the upper sky is not an empty gradient.
  vec2 cell = floor(dir.xy * 190.0);
  float spark = ftHash(cell);
  float twinkle = 0.5 + 0.5 * sin(uTime * 0.9 + spark * 40.0);
  col += vec3(0.5, 0.72, 1.0) * step(0.9975, spark) * twinkle * smoothstep(0.02, 0.5, dir.y) * 0.7;

  // Ordered-ish dither: a wide dark gradient at 8 bits will band without it.
  col += (ftHash(gl_FragCoord.xy) - 0.5) * 0.0055;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function Backdrop() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uTime: windUniforms.uTime },
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
      }),
    [],
  );

  return (
    <mesh material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[70, 32, 20]} />
    </mesh>
  );
}

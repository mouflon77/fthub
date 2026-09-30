'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { noiseGLSL } from '@/lib/glsl/noise';
import { skyGLSL } from '@/lib/glsl/sky';
import { FT_GUST_SLOTS } from '@/lib/glsl/wind';
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
#define FT_GUSTS ${FT_GUST_SLOTS}

${noiseGLSL}
${skyGLSL}

uniform float uTime;
uniform vec3 uPointer;
uniform float uPointerAmp;
uniform vec4 uGusts[FT_GUSTS];

varying vec3 vWorld;

void main() {
  vec2 p = vWorld.xz;
  float dist = length(cameraPosition - vWorld);

  // Meadow mottling at two scales stands in for the grass we do not build.
  float coarse = snoise(vec3(p * 0.13, 0.0)) * 0.5 + 0.5;
  float fine = snoise(vec3(p * 0.9, 4.0)) * 0.5 + 0.5;
  float mottle = mix(coarse, fine, 0.4);

  vec3 col = mix(vec3(0.38, 0.62, 0.74), vec3(0.82, 0.93, 0.98), mottle);

  col += vec3(0.45, 0.72, 1.0) * exp(-length(p - vec2(-3.4, -2.2)) * 0.16) * 0.28;
  col += vec3(1.0, 0.88, 0.72) * exp(-length(p - vec2(5.6, -3.4)) * 0.2) * 0.12;

  float pull = exp(-length(p - uPointer.xz) * 0.7);
  col += vec3(0.55, 0.82, 1.0) * pull * uPointerAmp * 0.35;

  for (int i = 0; i < FT_GUSTS; i++) {
    vec4 g = uGusts[i];
    if (g.w < 0.0) continue;
    float age = uTime - g.w;
    if (age < 0.0 || age > 2.8) continue;
    float dr = length(p - g.xy) - age * 5.4;
    col += vec3(0.55, 0.82, 1.0) * exp(-dr * dr * 2.6) * exp(-age * 1.5) * 0.45;
  }

  col = ftHaze(col, dist, normalize(vWorld - cameraPosition));
  gl_FragColor = vec4(col, 1.0);
}
`;

export function Ground() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: windUniforms.uTime,
          uPointer: windUniforms.uPointer,
          uPointerAmp: windUniforms.uPointerAmp,
          uGusts: windUniforms.uGusts,
        },
      }),
    [],
  );

  return (
    <mesh material={material} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} renderOrder={-5}>
      <planeGeometry args={[110, 110, 1, 1]} />
    </mesh>
  );
}

'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { noiseGLSL } from '@/lib/glsl/noise';
import { skyGLSL } from '@/lib/glsl/sky';
import { windGLSL } from '@/lib/glsl/wind';
import { buildGrass } from '@/lib/garden/grass';
import { windUniforms } from '@/lib/garden/state';

const vertexShader = /* glsl */ `
${noiseGLSL}
${windGLSL}

attribute vec3 aBase;
attribute float aHeight;
attribute float aSeed;
attribute float aShade;

varying vec3 vNormal;
varying vec3 vWorld;
varying float vH;
varying float vShade;

void main() {
  vec3 local = position;
  vec3 nrm = normal;

  vec2 force = ftWindAt(aBase, aSeed);
  // Stiffer than the flowers: short blades should not lie flat when a tall
  // stem is only just starting to lean.
  float stiffness = 0.95 + fract(aSeed * 0.371) * 0.85;
  ftBend(local, nrm, force, aHeight, stiffness);

  // A fast rattle on top of the bend keeps individual blades from moving in
  // lockstep with their neighbours.
  float rattle = sin(uTime * (6.5 + fract(aSeed * 0.113) * 4.5) + aSeed * 13.0);
  local.x += rattle * aHeight * aHeight * 0.007 * uMotion;

  vec3 world = local + aBase;
  vWorld = world;
  vNormal = nrm;
  vH = aHeight;
  vShade = aShade;

  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

const fragmentShader = /* glsl */ `
${noiseGLSL}
${skyGLSL}

varying vec3 vNormal;
varying vec3 vWorld;
varying float vH;
varying float vShade;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  if (!gl_FrontFacing) N = -N;

  float key = max(dot(N, FT_KEY_DIR), 0.0);
  float warm = max(dot(N, FT_WARM_DIR), 0.0);

  vec3 col = mix(vec3(0.22, 0.48, 0.60), vec3(0.62, 0.84, 0.94), pow(vH, 1.55)) * mix(0.78, 1.05, vShade);
  col += vec3(0.28, 0.58, 0.95) * key * 0.22;
  col += vec3(1.0, 0.86, 0.7) * warm * 0.04;

  float rim = pow(1.0 - abs(dot(N, V)), 3.0);
  col += vec3(0.7, 0.88, 1.0) * rim * 0.28 * vH;

  col = ftHaze(col, length(cameraPosition - vWorld), -V);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function Grass({ count }: { count: number }) {
  const geometry = useMemo(() => buildGrass(count), [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: windUniforms,
        side: THREE.DoubleSide,
      }),
    [],
  );

  return <mesh geometry={geometry} material={material} />;
}

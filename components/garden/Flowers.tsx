'use client';

import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { noiseGLSL } from '@/lib/glsl/noise';
import { skyGLSL } from '@/lib/glsl/sky';
import { windGLSL } from '@/lib/glsl/wind';
import { glassGLSL } from '@/lib/glsl/glass';
import { buildFlowerField, flowerSpecs } from '@/lib/garden/flowers';
import { windUniforms } from '@/lib/garden/state';

const vertexShader = /* glsl */ `
${noiseGLSL}
${windGLSL}

attribute vec3 aBase;
attribute float aHeight;
attribute float aSeed;
attribute vec3 aTint;
attribute float aFlutter;
attribute float aGlow;

varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vTint;
varying vec2 vUv;
varying float vGlow;
varying float vSeed;

void main() {
  vec3 local = position;
  vec3 nrm = normal;

  vec2 force = ftWindAt(aBase, aSeed);
  float stiffness = 0.8 + fract(aSeed * 0.517) * 0.65;
  ftBend(local, nrm, force, aHeight, stiffness);

  // Petals and leaves flutter on their own clock, harder when the air moves.
  float energy = length(force);
  float wobble = sin(uTime * (3.3 + fract(aSeed * 0.31) * 2.6) + aSeed * 21.0 + aFlutter * 5.2);
  local += nrm * wobble * aFlutter * (0.005 + energy * 0.018) * uMotion;

  vec3 world = local + aBase;

  vWorld = world;
  vNormal = nrm;
  vTint = aTint;
  vUv = uv;
  vGlow = aGlow;
  vSeed = aSeed;

  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

const fragmentShader = /* glsl */ `
${noiseGLSL}
${skyGLSL}
${glassGLSL}

varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vTint;
varying vec2 vUv;
varying float vGlow;
varying float vSeed;

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);

  // Moulded ribbing. Real cast glass is never optically flat, and the crawling
  // speculars this produces are most of what sells the material.
  vec3 tangent = normalize(cross(N, vec3(0.0, 1.0, 0.0)) + vec3(1.0e-4));
  vec3 bitangent = cross(N, tangent);
  float ribs = cos(vUv.y * 15.0 + vSeed * 6.0) * 0.5;
  float spine = cos(vUv.x * 6.0 + vSeed * 2.0) * 0.32;
  float detail = (1.0 - clamp(vGlow, 0.0, 1.0)) * 0.05;
  N = normalize(N + (tangent * ribs + bitangent * spine) * detail);

  float alpha;
  vec3 col = ftGlass(N, V, vTint, 1.46, 2.0, 0.95, 0.4, vGlow, alpha);

  col = ftHaze(col, length(cameraPosition - vWorld), -V);
  gl_FragColor = vec4(col, alpha);
}
`;

export function Flowers({ count }: { count: number }) {
  const size = useThree((state) => state.size);

  // Quantised so a resize drag cannot trigger a rebuild on every frame.
  const spread = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    if (aspect < 1) return 0.52;
    if (aspect < 1.35) return 0.76;
    return 1;
  }, [size.width, size.height]);

  const geometry = useMemo(() => buildFlowerField(flowerSpecs(count, 8, spread)), [count, spread]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: windUniforms,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  return <mesh geometry={geometry} material={material} renderOrder={4} />;
}

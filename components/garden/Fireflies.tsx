'use client';

import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { noiseGLSL } from '@/lib/glsl/noise';
import { windGLSL } from '@/lib/glsl/wind';
import { rng } from '@/lib/garden/builder';
import { windUniforms } from '@/lib/garden/state';

const vertexShader = /* glsl */ `
${noiseGLSL}
${windGLSL}

attribute float aSeed;
attribute vec3 aTint;

uniform float uSize;
uniform float uDpr;

varying vec3 vTint;
varying float vFlicker;

void main() {
  vec3 p = position;

  // Each mote wanders on its own slow noise orbit, then gets pushed by the
  // same wind field the plants use.
  vec3 drift = vec3(
    snoise(vec3(p.xz * 0.22, uTime * 0.07 + aSeed)),
    snoise(vec3(p.zy * 0.22 + 5.0, uTime * 0.055 + aSeed)),
    snoise(vec3(p.yx * 0.22 + 9.0, uTime * 0.062 + aSeed))
  );
  p += drift * vec3(1.1, 0.6, 1.1) * uMotion;
  p.xz += ftWindAt(vec3(p.x, 0.0, p.z), aSeed) * 0.3;

  vec4 mv = viewMatrix * vec4(p, 1.0);
  float pulse = 0.5 + 0.5 * sin(uTime * (1.2 + fract(aSeed * 0.31) * 2.4) + aSeed * 11.0);

  vTint = aTint;
  vFlicker = 0.25 + 0.75 * pulse * pulse;

  gl_PointSize = uSize * uDpr * (0.6 + fract(aSeed * 0.77)) / max(-mv.z, 0.25);
  gl_Position = projectionMatrix * mv;
}
`;

const fragmentShader = /* glsl */ `
varying vec3 vTint;
varying float vFlicker;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = exp(-d * d * 42.0);
  float halo = exp(-d * d * 9.0);
  float a = (core + halo * 0.35) * vFlicker;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vTint * (core * 2.4 + halo * 0.5) * vFlicker, a);
}
`;

const COOL = new THREE.Color('#dff2ff');
const WARM = new THREE.Color('#fff4e4');

export function Fireflies({ count }: { count: number }) {
  const dpr = useThree((state) => state.viewport.dpr);
  const uniforms = useMemo(
    () => ({
      ...windUniforms,
      uSize: { value: 34 },
      uDpr: { value: 1 },
    }),
    [],
  );

  useFrame(() => {
    uniforms.uDpr.value = dpr;
  });

  const geometry = useMemo(() => {
    const rand = rng(77);
    const position = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const tint = new Float32Array(count * 3);
    const colour = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const radius = Math.pow(rand(), 0.6) * 13;
      const angle = rand() * Math.PI * 2;
      position[i * 3] = Math.cos(angle) * radius;
      position[i * 3 + 1] = 0.12 + Math.pow(rand(), 1.7) * 3.6;
      position[i * 3 + 2] = Math.sin(angle) * radius * 0.8 + 1;
      seed[i] = rand() * 100;
      colour.copy(rand() < 0.12 ? WARM : COOL).multiplyScalar(0.7 + rand() * 0.55);
      tint[i * 3] = colour.r;
      tint[i * 3 + 1] = colour.g;
      tint[i * 3 + 2] = colour.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aTint', new THREE.BufferAttribute(tint, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, 0), 30);
    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );

  return <points geometry={geometry} material={material} renderOrder={6} />;
}

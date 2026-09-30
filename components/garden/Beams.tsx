'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { noiseGLSL } from '@/lib/glsl/noise';
import { windUniforms } from '@/lib/garden/state';

/**
 * Soft light shafts. Rather than march a volume, each shaft is a quad that
 * billboards around the vertical axis only — which is exactly how a real shaft
 * behaves as you move around it — with the cone profile drawn in the shader.
 */
const vertexShader = /* glsl */ `
uniform vec3 uCenter;
uniform vec2 uSize;

varying vec2 vUv;

void main() {
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  right.y = 0.0;
  right = normalize(right + vec3(1.0e-4, 0.0, 0.0));

  vec3 world = uCenter + right * position.x * uSize.x + vec3(0.0, position.y * uSize.y, 0.0);

  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

const fragmentShader = /* glsl */ `
${noiseGLSL}

uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uSeed;

varying vec2 vUv;

void main() {
  // Narrow at the top where the light enters, spreading toward the ground.
  float spread = mix(1.0, 0.26, vUv.y);
  float across = abs(vUv.x - 0.5) * 2.0 / spread;
  float body = 1.0 - smoothstep(0.35, 1.0, across);

  float top = smoothstep(1.0, 0.72, vUv.y);
  float bottom = smoothstep(0.0, 0.42, vUv.y);
  float streak = 0.72 + 0.28 * snoise(vec3(vUv.x * 5.0 + uSeed, vUv.y * 1.6, uTime * 0.09));

  float a = body * top * bottom * streak * uIntensity;
  if (a < 0.002) discard;
  gl_FragColor = vec4(uColor * a, a);
}
`;

type Shaft = {
  center: [number, number, number];
  size: [number, number];
  color: string;
  intensity: number;
};

const SHAFTS: Shaft[] = [
  { center: [-4.2, 2.7, -3.0], size: [3.4, 5.4], color: '#9fd0ff', intensity: 0.42 },
  { center: [5.4, 2.5, -4.2], size: [3.0, 5.0], color: '#cfe8ff', intensity: 0.28 },
  { center: [0.6, 3.1, -7.4], size: [4.4, 6.2], color: '#7eb8ff', intensity: 0.22 },
];

export function Beams({ count }: { count: number }) {
  const shafts = useMemo(() => SHAFTS.slice(0, count), [count]);

  return (
    <>
      {shafts.map((shaft, i) => (
        <Beam key={i} shaft={shaft} seed={i * 4.7} />
      ))}
    </>
  );
}

function Beam({ shaft, seed }: { shaft: Shaft; seed: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: windUniforms.uTime,
          uCenter: { value: new THREE.Vector3(...shaft.center) },
          uSize: { value: new THREE.Vector2(...shaft.size) },
          uColor: { value: new THREE.Color(shaft.color) },
          uIntensity: { value: shaft.intensity },
          uSeed: { value: seed },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [shaft, seed],
  );

  return (
    <mesh material={material} renderOrder={2} frustumCulled={false}>
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  );
}

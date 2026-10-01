'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { circuitUniforms } from '@/lib/circuit/state';

type Tower = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  phase: number;
  bandSpeed: number;
  accent: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

function buildTowers(count: number): Tower[] {
  const rand = rng(91);
  const towers: Tower[] = [];
  let guard = 0;

  while (towers.length < count && guard < count * 40) {
    guard += 1;
    // Keep the whole skyline behind the emblem (logo sits around z ≈ -7.5).
    const side = rand() > 0.5 ? 1 : -1;
    const lane = Math.floor(rand() * 3);
    let x = 0;
    let z = 0;

    if (lane === 0) {
      // Left / right flanks, still well behind the mark
      x = side * (16 + rand() * 18);
      z = -18 - rand() * 16;
    } else if (lane === 1) {
      // Far back skyline
      x = (rand() - 0.5) * 46;
      z = -24 - rand() * 24;
    } else {
      // Mid-depth wings
      x = side * (12 + rand() * 14);
      z = -16 - rand() * 12;
    }

    // Wide centre corridor so towers never sit through the logo.
    if (Math.abs(x) < 9 && z > -40) continue;
    if (towers.some((t) => (t.x - x) ** 2 + (t.z - z) ** 2 < 5.5)) continue;

    const height = 5.5 + Math.pow(rand(), 0.55) * 18;
    towers.push({
      x,
      z,
      width: 0.75 + rand() * 1.7,
      depth: 0.75 + rand() * 1.6,
      height,
      phase: rand() * Math.PI * 2,
      bandSpeed: 0.25 + rand() * 0.7,
      accent: rand() > 0.72 ? 1 : 0,
    });
  }

  return towers;
}

const vertexShader = /* glsl */ `
attribute float aHeight;
attribute float aPhase;
attribute float aBandSpeed;
attribute float aAccent;

varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
varying float vHeight;
varying float vPhase;
varying float vBandSpeed;
varying float vAccent;

void main() {
  vUv = uv;
  vHeight = aHeight;
  vPhase = aPhase;
  vBandSpeed = aBandSpeed;
  vAccent = aAccent;

  vec4 transformed = vec4(position, 1.0);
  #ifdef USE_INSTANCING
    transformed = instanceMatrix * transformed;
  #endif
  vec4 world = modelMatrix * transformed;
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uMotion;
uniform vec3 uIce;
uniform vec3 uCircuit;
uniform vec3 uPulse;

varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
varying float vHeight;
varying float vPhase;
varying float vBandSpeed;
varying float vAccent;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);

  // Ice glass facade, darker with height so the skyline has mass.
  float storey = clamp(vWorld.y / max(vHeight, 0.1), 0.0, 1.0);
  vec3 facade = mix(uIce * 0.94, vec3(0.48, 0.56, 0.46), storey * 0.55);
  vec3 col = mix(facade, vec3(1.0), fres * 0.35);

  // Window grid.
  float wx = abs(fract(vUv.x * 8.0) - 0.5);
  float wy = abs(fract(vUv.y * (vHeight * 1.15)) - 0.5);
  float window = (1.0 - smoothstep(0.0, 0.12, wx)) * (1.0 - smoothstep(0.0, 0.14, wy));
  col += mix(uCircuit, uPulse, vAccent) * window * 0.12;

  // Constantly fluctuating light bands climbing the tower.
  float climb = fract(vUv.y * 2.4 - uTime * vBandSpeed * uMotion + vPhase);
  float band = smoothstep(0.0, 0.08, climb) * (1.0 - smoothstep(0.14, 0.28, climb));
  float band2 = smoothstep(0.45, 0.55, climb) * (1.0 - smoothstep(0.62, 0.78, climb)) * 0.55;
  float pulse = 0.65 + 0.35 * sin(uTime * (0.8 + vBandSpeed) + vPhase * 2.0);
  vec3 accent = mix(uCircuit, uPulse, vAccent);
  col += accent * (band + band2) * pulse * 1.35;
  col += accent * fres * 0.18;

  // Atmospheric fade into the ice mist.
  float haze = smoothstep(18.0, 48.0, length(vWorld.xz));
  col = mix(col, uIce, haze * 0.55);

  float alpha = clamp(0.42 + fres * 0.35 + (band + band2) * 0.3, 0.35, 0.92);
  gl_FragColor = vec4(col, alpha);
}
`;

/**
 * Far-field skyline: dense glass towers with light bands that keep climbing
 * and breathing so the horizon never goes still.
 */
export function Skyline({ count }: { count: number }) {
  const { mesh } = useMemo(() => {
    const towers = buildTowers(count);
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);

    const heights = new Float32Array(towers.length);
    const phases = new Float32Array(towers.length);
    const speeds = new Float32Array(towers.length);
    const accents = new Float32Array(towers.length);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: circuitUniforms.uTime,
        uMotion: circuitUniforms.uMotion,
        uIce: circuitUniforms.uIce,
        uCircuit: circuitUniforms.uCircuit,
        uPulse: circuitUniforms.uPulse,
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.InstancedMesh(geo, material, towers.length);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < towers.length; i++) {
      const tower = towers[i];
      heights[i] = tower.height;
      phases[i] = tower.phase;
      speeds[i] = tower.bandSpeed;
      accents[i] = tower.accent;
      dummy.position.set(tower.x, 0, tower.z);
      dummy.scale.set(tower.width, tower.height, tower.depth);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    geo.setAttribute('aHeight', new THREE.InstancedBufferAttribute(heights, 1));
    geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
    geo.setAttribute('aBandSpeed', new THREE.InstancedBufferAttribute(speeds, 1));
    geo.setAttribute('aAccent', new THREE.InstancedBufferAttribute(accents, 1));

    return { mesh };
  }, [count]);

  return <primitive object={mesh} renderOrder={-5} frustumCulled={false} />;
}

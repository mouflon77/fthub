'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { ChipSpec } from '@/lib/circuit/network';
import { circuitUniforms } from '@/lib/circuit/state';

const dieVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const dieFragment = /* glsl */ `
uniform vec3 uIce;
uniform vec3 uCircuit;
uniform vec3 uPulse;
uniform vec3 uAccent;
uniform float uTime;
uniform float uPhase;
uniform float uFlowSpeed;
uniform float uMotion;

varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.6);

  // Silicon die: cool glass body with a darker core.
  vec3 silicon = mix(vec3(0.55, 0.68, 0.78), uIce, 0.45);
  vec3 col = mix(silicon, uAccent * 0.7, 0.18);
  col = mix(col, vec3(1.0), fres * 0.5);

  // Bond-wire style lanes across the die face.
  float lanes = abs(fract(vUv.x * 7.0) - 0.5);
  float lane = 1.0 - smoothstep(0.0, 0.07, lanes);
  float rows = abs(fract(vUv.y * 5.0) - 0.5);
  float row = 1.0 - smoothstep(0.0, 0.08, rows);
  col += uAccent * (lane * 0.12 + row * 0.08);

  // Light flowing in and out along the die: a soft travelling front.
  float flow = fract(vUv.x * 0.85 - uTime * uFlowSpeed * uMotion + uPhase);
  float pulseIn = smoothstep(0.0, 0.18, flow) * (1.0 - smoothstep(0.28, 0.48, flow));
  float pulseOut = smoothstep(0.52, 0.68, flow) * (1.0 - smoothstep(0.78, 0.95, flow));
  float breath = 0.55 + 0.45 * sin(uTime * 0.9 + uPhase);
  col += uAccent * (pulseIn * 1.15 + pulseOut * 0.85) * breath;
  col += uAccent * fres * 0.2;

  float alpha = clamp(0.38 + fres * 0.4 + (pulseIn + pulseOut) * 0.25, 0.32, 0.88);
  gl_FragColor = vec4(col, alpha);
}
`;

function ChipMesh({ spec }: { spec: ChipSpec }) {
  const accent = spec.accent === 'pulse' ? circuitUniforms.uPulse : circuitUniforms.uCircuit;

  const dieMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dieVertex,
        fragmentShader: dieFragment,
        uniforms: {
          uIce: circuitUniforms.uIce,
          uCircuit: circuitUniforms.uCircuit,
          uPulse: circuitUniforms.uPulse,
          uAccent: accent,
          uTime: circuitUniforms.uTime,
          uPhase: { value: spec.phase },
          uFlowSpeed: { value: spec.flowSpeed },
          uMotion: circuitUniforms.uMotion,
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [accent, spec.phase, spec.flowSpeed],
  );

  const pinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8a968c',
        metalness: 0.75,
        roughness: 0.28,
        emissive: spec.accent === 'pulse' ? '#d8ef56' : '#0d2119',
        emissiveIntensity: 0.12,
      }),
    [spec.accent],
  );

  const pins = useMemo(() => {
    const list: Array<{ x: number; z: number }> = [];
    const count = spec.pins;
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count - 0.5;
      list.push({ x: t * spec.width * 0.82, z: -spec.depth * 0.58 });
      list.push({ x: t * spec.width * 0.82, z: spec.depth * 0.58 });
    }
    return list;
  }, [spec.pins, spec.width, spec.depth]);

  return (
    <group position={[spec.x, 0, spec.z]} rotation={[0, spec.rotation, 0]}>
      {/* Substrate pad under the die. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[spec.width * 1.18, spec.depth * 1.28]} />
        <meshBasicMaterial color="#d7e4ef" transparent opacity={0.55} />
      </mesh>

      <mesh
        material={dieMaterial}
        position={[0, spec.height * 0.5 + 0.02, 0]}
        renderOrder={6}
      >
        <boxGeometry args={[spec.width, spec.height, spec.depth]} />
      </mesh>

      {/* Tiny glass window on top of the die. */}
      <mesh position={[0, spec.height + 0.028, 0]} renderOrder={7}>
        <boxGeometry args={[spec.width * 0.55, 0.02, spec.depth * 0.45]} />
        <meshBasicMaterial color="#e8f1f5" transparent opacity={0.55} />
      </mesh>

      {pins.map((pin, index) => (
        <mesh
          key={index}
          material={pinMaterial}
          position={[pin.x, 0.028, pin.z]}
        >
          <boxGeometry args={[0.045, 0.025, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

/** Glass silicon dies with light slowly flowing in and out across the package. */
export function Chips({ specs }: { specs: ChipSpec[] }) {
  return (
    <group>
      {specs.map((spec, index) => (
        <ChipMesh key={`${spec.x}-${spec.z}-${index}`} spec={spec} />
      ))}
    </group>
  );
}

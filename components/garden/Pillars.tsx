'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PillarSpec } from '@/lib/circuit/network';
import { circuitUniforms } from '@/lib/circuit/state';

const vertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
varying float vY;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
  vY = uv.y;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uIce;
uniform vec3 uCircuit;
uniform vec3 uPulse;
uniform vec3 uAccent;
uniform float uTime;
uniform float uEdgePhase;
uniform float uEdgeSpeed;
uniform float uMotion;

varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
varying float vY;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.2);

  // Body: frosted silicon tower.
  vec3 col = mix(uIce * 0.96, uAccent * 0.55, 0.22 + vY * 0.18);
  col = mix(col, vec3(1.0), fres * 0.45);

  // Tron edge: a travelling light band around the circumference.
  float angle = atan(vNormal.z, vNormal.x);
  float orbit = fract((angle / 6.28318) + uTime * uEdgeSpeed * uMotion + uEdgePhase);
  float band = smoothstep(0.0, 0.04, orbit) * (1.0 - smoothstep(0.08, 0.14, orbit));
  // Second thinner trail for a more cinematic edge.
  float trail = smoothstep(0.14, 0.22, orbit) * (1.0 - smoothstep(0.28, 0.4, orbit)) * 0.35;
  float rim = band + trail;

  // Soft vertical sweep so the edge feels powered.
  float lift = 0.55 + 0.45 * sin(vY * 9.0 + uTime * 1.1 + uEdgePhase);
  col += uAccent * rim * lift * 1.8;
  col += uAccent * fres * 0.25;

  float alpha = clamp(0.22 + fres * 0.5 + rim * 0.55, 0.18, 0.85);
  gl_FragColor = vec4(col, alpha);
}
`;

function PillarMesh({ spec }: { spec: PillarSpec }) {
  const group = useRef<THREE.Group>(null);
  const accent = spec.accent === 'pulse' ? circuitUniforms.uPulse : circuitUniforms.uCircuit;

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uIce: circuitUniforms.uIce,
          uCircuit: circuitUniforms.uCircuit,
          uPulse: circuitUniforms.uPulse,
          uAccent: accent,
          uTime: circuitUniforms.uTime,
          uEdgePhase: { value: spec.phase },
          uEdgeSpeed: { value: spec.edgeSpeed },
          uMotion: circuitUniforms.uMotion,
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [accent, spec.phase, spec.edgeSpeed],
  );

  const cap = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: spec.accent === 'pulse' ? '#e6f88e' : '#1a3a2e',
        emissive: spec.accent === 'pulse' ? '#d8ef56' : '#0d2119',
        emissiveIntensity: 0.45,
        metalness: 0.2,
        roughness: 0.35,
        transparent: true,
        opacity: 0.85,
      }),
    [spec.accent],
  );

  useFrame(() => {
    if (!group.current) return;
    const t = circuitUniforms.uTime.value * circuitUniforms.uMotion.value;
    const rise = Math.sin(t * spec.speed + spec.phase) * spec.amp;
    group.current.position.y = rise;
  });

  return (
    <group position={[spec.x, 0, spec.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[spec.radius * 1.05, spec.radius * 1.55, 28]} />
        <meshBasicMaterial color="#0d2119" transparent opacity={0.28} />
      </mesh>
      <group ref={group}>
        <mesh material={material} position={[0, spec.height * 0.5, 0]} renderOrder={5}>
          <cylinderGeometry args={[spec.radius, spec.radius * 1.05, spec.height, 28, 1, true]} />
        </mesh>
        <mesh material={material} position={[0, spec.height, 0]} renderOrder={5}>
          <cylinderGeometry args={[spec.radius * 0.92, spec.radius * 0.92, 0.04, 24]} />
        </mesh>
        <mesh material={cap} position={[0, spec.height + 0.03, 0]}>
          <cylinderGeometry args={[spec.radius * 0.35, spec.radius * 0.35, 0.05, 16]} />
        </mesh>
      </group>
    </group>
  );
}

/** Rising and falling glass towers with a Tron edge light circling each shaft. */
export function Pillars({ specs }: { specs: PillarSpec[] }) {
  return (
    <group>
      {specs.map((spec, index) => (
        <PillarMesh key={`${spec.x}-${spec.z}-${index}`} spec={spec} />
      ))}
    </group>
  );
}

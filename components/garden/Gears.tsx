'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GearSpec } from '@/lib/circuit/network';
import { buildGearShape } from '@/lib/circuit/network';
import { circuitUniforms } from '@/lib/circuit/state';

const vertexShader = /* glsl */ `
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

const fragmentShader = /* glsl */ `
uniform vec3 uIce;
uniform vec3 uCircuit;
uniform vec3 uPulse;
uniform vec3 uTint;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 3.4);

  vec3 col = mix(uIce * 1.05, uTint, 0.42);
  col = mix(col, vec3(1.0), fres * 0.55);
  col += uTint * pow(ndv, 2.0) * 0.18;

  // Soft specular ridge on the teeth.
  float ridge = pow(max(dot(N, normalize(vec3(0.35, 0.9, 0.2))), 0.0), 48.0);
  col += vec3(1.0) * ridge * 0.55;

  float pulse = 0.5 + 0.5 * sin(uTime * 0.7 + vWorld.x * 0.4);
  col += uCircuit * pulse * 0.06 * fres;

  float alpha = clamp(0.28 + fres * 0.55, 0.22, 0.78);
  gl_FragColor = vec4(col, alpha);
}
`;

function tintColor(tint: GearSpec['tint']) {
  if (tint === 'pulse') return circuitUniforms.uPulse;
  if (tint === 'circuit') return circuitUniforms.uCircuit;
  return circuitUniforms.uIce;
}

function GearMesh({ spec }: { spec: GearSpec }) {
  const ref = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const shape = buildGearShape(spec.teeth, 1);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: spec.thickness / Math.max(spec.radius, 0.01),
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.035,
      bevelSegments: 2,
      curveSegments: 3,
    });
    geo.rotateX(-Math.PI / 2);
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, [spec.teeth, spec.thickness, spec.radius]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uIce: circuitUniforms.uIce,
          uCircuit: circuitUniforms.uCircuit,
          uPulse: circuitUniforms.uPulse,
          uTint: tintColor(spec.tint),
          uTime: circuitUniforms.uTime,
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [spec.tint],
  );

  const pad = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c5cfc4',
        metalness: 0.55,
        roughness: 0.4,
        transparent: true,
        opacity: 0.55,
      }),
    [],
  );

  useFrame(() => {
    if (!ref.current) return;
    const t = circuitUniforms.uTime.value * circuitUniforms.uMotion.value;
    ref.current.rotation.y = spec.phase + t * ((spec.rpm * Math.PI * 2) / 60);
  });

  return (
    <group position={[spec.x, 0, spec.z]}>
      {/* Ground plate so the gear reads as mounted to the board. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} material={pad}>
        <circleGeometry args={[spec.radius * 1.12, 28]} />
      </mesh>
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={pad}
      >
        <ringGeometry args={[spec.radius * 0.22, spec.radius * 0.34, 24]} />
      </mesh>
      <group ref={ref} position={[0, spec.y, 0]}>
        <mesh geometry={geometry} material={material} scale={spec.radius} renderOrder={4} />
      </group>
    </group>
  );
}

/** Glass kinetic gears, seated on frosted mounting pads at board level. */
export function Gears({ specs }: { specs: GearSpec[] }) {
  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[-3, 7, 2]} intensity={0.65} color="#e8f1f5" />
      <directionalLight position={[4, 3, -2]} intensity={0.28} color="#ffb070" />
      {specs.map((spec, index) => (
        <GearMesh key={`${spec.x}-${spec.z}-${index}`} spec={spec} />
      ))}
    </group>
  );
}

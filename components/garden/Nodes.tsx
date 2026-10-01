'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CircuitNode } from '@/lib/circuit/network';
import { circuitUniforms, pulseSlots } from '@/lib/circuit/state';

const PULSE_SLOTS = 5;

const vertexShader = /* glsl */ `
attribute float aKind;
varying vec3 vWorld;
varying float vKind;

void main() {
  vKind = aKind;
  vec4 transformed = vec4(position, 1.0);
  #ifdef USE_INSTANCING
    transformed = instanceMatrix * transformed;
  #endif
  vec4 world = modelMatrix * transformed;
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
#define PULSES ${PULSE_SLOTS}

uniform float uTime;
uniform vec3 uCircuit;
uniform vec3 uPulse;
uniform vec3 uPulseOrigins[PULSES];
uniform float uPulseStarts[PULSES];
uniform float uPulseStrengths[PULSES];
uniform vec3 uPointer;
uniform float uPointerAmp;

varying float vKind;
varying vec3 vWorld;

void main() {
  vec3 base = mix(uCircuit, uPulse, step(1.5, vKind) * (1.0 - step(2.5, vKind)));
  if (vKind > 2.5) base = mix(uCircuit, vec3(0.55, 0.62, 0.7), 0.4);
  if (vKind > 0.5 && vKind < 1.5) base = mix(uCircuit, uPulse, 0.35);

  float near = exp(-length(vWorld.xz - uPointer.xz) * 2.2);
  vec3 col = mix(base, uPulse, near * uPointerAmp * 0.55);
  float glow = 0.35 + near * uPointerAmp * 0.45;

  for (int i = 0; i < PULSES; i++) {
    float start = uPulseStarts[i];
    float strength = uPulseStrengths[i];
    if (strength < 0.01 || start < 0.0) continue;
    float age = uTime - start;
    if (age < 0.0 || age > 2.6) continue;
    float radius = age * 4.8;
    float dist = length(vWorld.xz - uPulseOrigins[i].xz);
    float ring = exp(-pow((dist - radius) * 3.2, 2.0));
    float fade = exp(-age * 1.1) * strength;
    col = mix(col, uPulse, clamp(ring * fade, 0.0, 1.0));
    glow += ring * fade * 1.2;
  }

  gl_FragColor = vec4(col * (0.75 + glow * 0.6), clamp(0.55 + glow * 0.35, 0.0, 1.0));
}
`;

export function Nodes({ nodes }: { nodes: CircuitNode[] }) {
  const { mesh, material } = useMemo(() => {
    const geo = new THREE.CircleGeometry(1, 18);
    geo.rotateX(-Math.PI / 2);

    const kindOf = (kind: CircuitNode['kind']) => {
      if (kind === 'hub') return 1;
      if (kind === 'cap') return 2;
      if (kind === 'via') return 3;
      return 0;
    };

    const kinds = new Float32Array(nodes.length);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: circuitUniforms.uTime,
        uCircuit: circuitUniforms.uCircuit,
        uPulse: circuitUniforms.uPulse,
        uPulseOrigins: { value: pulseSlots.origins },
        uPulseStarts: { value: pulseSlots.starts },
        uPulseStrengths: { value: pulseSlots.strengths },
        uPointer: circuitUniforms.uPointer,
        uPointerAmp: circuitUniforms.uPointerAmp,
      },
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.InstancedMesh(geo, material, nodes.length);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      kinds[i] = kindOf(node.kind);
      dummy.position.set(node.x, 0.035, node.z);
      dummy.scale.setScalar(node.radius);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    geo.setAttribute('aKind', new THREE.InstancedBufferAttribute(kinds, 1));

    return { mesh, material };
  }, [nodes]);

  useFrame(() => {
    material.uniforms.uPulseStarts.value = pulseSlots.starts;
    material.uniforms.uPulseStrengths.value = pulseSlots.strengths;
  });

  return <primitive object={mesh} renderOrder={3} />;
}

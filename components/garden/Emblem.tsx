'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { circuitUniforms, viewState } from '@/lib/circuit/state';

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;

void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uMap;
uniform float uTime;
uniform float uOpacity;
uniform vec3 uCircuit;
uniform vec3 uPulse;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;

void main() {
  vec4 tex = texture2D(uMap, vUv);
  float mask = tex.a;
  if (mask < 0.04) discard;

  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 2.4);

  // Near-black glass body from the real mark silhouette.
  vec3 base = vec3(0.04, 0.045, 0.055);
  vec3 col = mix(base, base * 1.55, fres * 0.55);

  float sweep = 0.5 + 0.5 * sin(vUv.y * 10.0 + uTime * 0.9 + fres * 4.0);
  vec3 accent = mix(uCircuit, uPulse, sweep);
  col += accent * fres * 0.9;
  col += accent * pow(fres, 2.8) * 0.45;
  col += vec3(0.9, 0.94, 1.0) * pow(ndv, 10.0) * 0.1;

  float alpha = mask * clamp(0.78 + fres * 0.22, 0.6, 0.96) * uOpacity;
  gl_FragColor = vec4(col, alpha);
}
`;

/**
 * Brand mark from the official artwork — textured so the interlocking loops
 * and centre diamond match the SVG exactly, with a dark glass rim glimmer.
 */
export function Emblem() {
  const group = useRef<THREE.Group>(null);
  const size = useThree((state) => state.size);
  const map = useLoader(THREE.TextureLoader, '/brand-mark.png');

  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    map.premultiplyAlpha = true;
    map.needsUpdate = true;
  }, [map]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uMap: { value: map },
          uTime: circuitUniforms.uTime,
          uOpacity: { value: 0.88 },
          uCircuit: circuitUniforms.uCircuit,
          uPulse: circuitUniforms.uPulse,
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
      }),
    [map],
  );

  const scale = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    return 5.4 * THREE.MathUtils.clamp(aspect / 1.55, 0.55, 1.05);
  }, [size]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const t = circuitUniforms.uTime.value;
    group.current.rotation.y = Math.sin(t * 0.07) * 0.1 + viewState.pointer.x * 0.06;
    group.current.rotation.x = viewState.pointer.y * -0.03;
    group.current.position.y = 2.15 + Math.sin(t * 0.19) * 0.05;

    const fade = 0.88 * (1 - THREE.MathUtils.clamp(viewState.scroll * 1.15, 0, 1));
    const opacity = material.uniforms.uOpacity;
    opacity.value += (fade - opacity.value) * (1 - Math.exp(-4 * Math.min(delta, 1 / 20)));
  });

  return (
    <group ref={group} position={[0, 2.15, -7.2]} scale={scale} renderOrder={2}>
      <mesh material={material}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  );
}

'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { skyGLSL } from '@/lib/glsl/sky';
import { glassGLSL } from '@/lib/glsl/glass';
import { windUniforms, viewState } from '@/lib/garden/state';

const vertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorld;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
${skyGLSL}
${glassGLSL}

uniform vec3 uTint;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vWorld;

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);

  float alpha;
  vec3 col = ftGlass(N, V, uTint, 1.5, 1.4, 1.1, 0.55, 0.035, alpha);

  gl_FragColor = vec4(col, alpha * uOpacity);
}
`;

/** One strand of the mark: a capsule outline with a capsule hole. */
function capsuleRing(width: number, height: number, thickness: number) {
  const outer = height / 2;
  const inner = Math.max(0.02, outer - thickness);
  const straight = width / 2 - outer;

  const trace = (path: THREE.Shape | THREE.Path, radius: number) => {
    path.moveTo(-straight, -radius);
    path.lineTo(straight, -radius);
    path.absarc(straight, 0, radius, -Math.PI / 2, Math.PI / 2, false);
    path.lineTo(-straight, radius);
    path.absarc(-straight, 0, radius, Math.PI / 2, Math.PI * 1.5, false);
  };

  const shape = new THREE.Shape();
  trace(shape, outer);
  const hole = new THREE.Path();
  trace(hole, inner);
  shape.holes.push(hole);
  return shape;
}

/**
 * The Frontier Tech Hub mark rebuilt as cast glass and set far behind the
 * garden, so the brand reads as part of the world rather than an overlay.
 */
export function Emblem() {
  const group = useRef<THREE.Group>(null);
  const size = useThree((state) => state.size);

  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(capsuleRing(3.6, 1.94, 0.36), {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.07,
      bevelSegments: 2,
      curveSegments: 22,
    });
    geo.translate(0, 0, -0.15);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTint: { value: new THREE.Color('#e8f4ff') },
          uOpacity: { value: 0.42 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const scale = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    return 2.15 * THREE.MathUtils.clamp(aspect / 1.6, 0.52, 1);
  }, [size]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const t = windUniforms.uTime.value;
    group.current.rotation.y = Math.sin(t * 0.07) * 0.16 + viewState.pointer.x * 0.1;
    group.current.rotation.x = viewState.pointer.y * -0.05;
    group.current.position.y = 4.4 + Math.sin(t * 0.19) * 0.07;

    // A hero-only element: it fades out rather than looming behind the copy.
    const fade = 0.46 * (1 - THREE.MathUtils.clamp(viewState.scroll * 1.5, 0, 1));
    const opacity = material.uniforms.uOpacity;
    opacity.value += (fade - opacity.value) * (1 - Math.exp(-4 * Math.min(delta, 1 / 20)));
  });

  return (
    <group ref={group} position={[0, 4.4, -17]} scale={scale}>
      <mesh geometry={geometry} material={material} rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.17]} />
      <mesh geometry={geometry} material={material} rotation={[0, 0, -Math.PI / 4]} position={[0, 0, -0.17]} />
    </group>
  );
}

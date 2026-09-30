import * as THREE from 'three';
import { rng } from './builder';

const ROWS = 5;
const COLS = 2;

/**
 * A meadow of blades merged into one geometry. Each blade carries its base
 * position so it can sample the same wind field as the flowers, and a shade
 * value so the field is not a flat wash of one colour.
 *
 * Density falls off with radius; the far meadow is carried by the ground
 * shader and the haze instead of by more geometry.
 */
export function buildGrass(count: number, seed = 21) {
  const rand = rng(seed);
  const position: number[] = [];
  const aBase: number[] = [];
  const aHeight: number[] = [];
  const aSeed: number[] = [];
  const aShade: number[] = [];
  const index: number[] = [];

  const p = new THREE.Vector3();

  for (let b = 0; b < count; b++) {
    // sqrt keeps area density even, then a bias pulls blades toward the camera
    const radius = Math.pow(rand(), 0.62) * 11.5;
    const angle = rand() * Math.PI * 2;
    const bx = Math.cos(angle) * radius;
    const bz = Math.sin(angle) * radius * 0.85 + 1.0;

    const height = 0.11 + rand() * 0.26;
    const width = 0.008 + rand() * 0.006;
    const arch = (0.22 + rand() * 0.5) * height;
    const ridge = 0.55 + rand() * 0.5;
    const spin = rand() * Math.PI * 2;
    const cos = Math.cos(spin);
    const sin = Math.sin(spin);
    const seedValue = rand() * 100;
    const shade = 0.55 + rand() * 0.6;

    const start = position.length / 3;

    for (let r = 0; r <= ROWS; r++) {
      const u = r / ROWS;
      const w = width * Math.pow(1 - u, 0.55);
      for (let c = 0; c <= COLS; c++) {
        const v = (c / COLS) * 2 - 1;
        // Centre column bulges forward so the blade has a curved section and
        // therefore a normal that changes across its width.
        const bulge = (1 - v * v) * ridge * w;
        const lx = v * w;
        const ly = height * u;
        const lz = arch * u * u + bulge;

        p.set(lx * cos - lz * sin, ly, lx * sin + lz * cos);
        position.push(p.x, p.y, p.z);
        aBase.push(bx, 0, bz);
        aHeight.push(u);
        aSeed.push(seedValue);
        aShade.push(shade);
      }
    }

    const stride = COLS + 1;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const a = start + r * stride + c;
        index.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute('aBase', new THREE.Float32BufferAttribute(aBase, 3));
  geometry.setAttribute('aHeight', new THREE.Float32BufferAttribute(aHeight, 1));
  geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(aSeed, 1));
  geometry.setAttribute('aShade', new THREE.Float32BufferAttribute(aShade, 1));
  geometry.setIndex(new THREE.Uint32BufferAttribute(index, 1));
  geometry.computeVertexNormals();
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.4, 0), 30);
  return geometry;
}

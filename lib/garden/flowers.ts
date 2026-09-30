import * as THREE from 'three';
import { PlantBuilder, rng, type PlantMeta } from './builder';

type PetalParams = {
  length: number;
  width: number;
  /** Radians the petal leans away from vertical by the tip. */
  open: number;
  /** Edge curl. Higher values cup the petal like a bowl. */
  cup: number;
  ruffle: number;
  twist: number;
  bendPow: number;
};

const UP = new THREE.Vector3(0, 1, 0);
const ACROSS = new THREE.Vector3(1, 0, 0);

/**
 * A petal as a parametric surface. u runs base to tip, v runs across the
 * width. The spine arcs outward as u grows, the cross-section is cupped by v
 * squared, and a twist rotates the section around the spine so no two petals
 * catch the light the same way.
 */
function petalPoint(u: number, vRaw: number, p: PetalParams, out = new THREE.Vector3()) {
  const v = vRaw * 2 - 1;
  const angle = p.open * Math.pow(u, p.bendPow) * 0.6;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // A broad oval rather than a needle: the sine profile is flattened by the
  // outer power so the petal keeps its width most of the way to a rounded tip.
  const width = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.52)), 0.6) * p.width * (1 - 0.22 * u) + 1e-5;
  const cup = p.cup * v * v * width;
  const ruffle = Math.sin(v * Math.PI * 2.2) * p.ruffle * width * u;

  // Section frame: tangent follows the spine, normal is perpendicular to it.
  const offset = new THREE.Vector3()
    .addScaledVector(ACROSS, v * width)
    .addScaledVector(new THREE.Vector3(0, -sin, cos), cup + ruffle)
    .applyAxisAngle(new THREE.Vector3(0, cos, sin), p.twist * u);

  return out.set(offset.x, p.length * u * cos + offset.y, p.length * u * sin + offset.z);
}

export type FlowerSpec = {
  base: THREE.Vector3;
  seed: number;
  scale: number;
  height: number;
  tint: THREE.Color;
  core: THREE.Color;
  petals: number;
  bud: boolean;
  nod: number;
  spin: number;
};

const PALETTE: Array<{ tint: string; core: string; weight: number }> = [
  { tint: '#c5e6ff', core: '#ffffff', weight: 3 },
  { tint: '#7ec4ff', core: '#eef8ff', weight: 4 },
  { tint: '#3d9bff', core: '#d9efff', weight: 4 },
  { tint: '#1d74e0', core: '#bfe4ff', weight: 2 },
  { tint: '#ffc48a', core: '#fff3e4', weight: 1 },
];

const WEIGHTED = PALETTE.flatMap((entry) => Array<typeof entry>(entry.weight).fill(entry));

type Zone = {
  share: number;
  x: [number, number];
  z: [number, number];
  height: [number, number];
  scale: [number, number];
};

/**
 * Flowers frame the edges and the foreground, leaving a calm corridor up the
 * middle of the frame for the headline to sit in.
 */
const ZONES: Zone[] = [
  { share: 0.2, x: [2.3, 6.0], z: [2.4, 4.3], height: [1.7, 2.5], scale: [1.5, 2.05] },
  { share: 0.36, x: [1.5, 5.7], z: [-1.7, 2.0], height: [1.1, 2.0], scale: [1.1, 1.55] },
  { share: 0.28, x: [0.2, 8.0], z: [-6.5, -2.0], height: [0.85, 1.7], scale: [0.85, 1.25] },
  { share: 0.16, x: [0.5, 2.4], z: [-1.4, 3.0], height: [0.45, 1.1], scale: [0.85, 1.3] },
];

const lerp = THREE.MathUtils.lerp;

/**
 * `spread` narrows the field for portrait viewports: the same flowers, pulled
 * in from the wings so they still frame a much narrower frame.
 */
export function flowerSpecs(count: number, seed = 8, spread = 1): FlowerSpec[] {
  const rand = rng(seed);
  const specs: FlowerSpec[] = [];

  ZONES.forEach((zone, zi) => {
    const n = Math.max(1, Math.round(count * zone.share));
    for (let i = 0; i < n; i++) {
      const swatch = WEIGHTED[Math.floor(rand() * WEIGHTED.length)];
      const x = lerp(zone.x[0], zone.x[1], rand()) * (rand() < 0.5 ? -1 : 1) * spread;
      specs.push({
        base: new THREE.Vector3(x, 0, lerp(zone.z[0], zone.z[1], rand())),
        seed: rand() * 100,
        scale: lerp(zone.scale[0], zone.scale[1], rand()),
        height: lerp(zone.height[0], zone.height[1], rand()),
        tint: new THREE.Color(swatch.tint),
        core: new THREE.Color(swatch.core),
        petals: 6 + Math.floor(rand() * 3),
        bud: zi !== 3 && rand() < 0.18,
        nod: 0.3 + rand() * 0.55,
        spin: rand() * Math.PI * 2,
      });
    }
  });

  // Back to front, so alpha blending inside the single merged draw call lands
  // in the right order for a camera that only ever drifts.
  return specs.sort((a, b) => a.base.z - b.base.z);
}

function buildFlower(builder: PlantBuilder, spec: FlowerSpec, rand: () => number) {
  const meta: PlantMeta = { base: spec.base, seed: spec.seed, tint: spec.tint, height: spec.height };
  const s = spec.scale;

  const leanX = (rand() - 0.5) * 0.36 * spec.height;
  const leanZ = (rand() - 0.5) * 0.28 * spec.height;
  const stem = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(leanX * 0.18, spec.height * 0.34, leanZ * 0.18),
    new THREE.Vector3(leanX * 0.7, spec.height * 0.71, leanZ * 0.7),
    new THREE.Vector3(leanX, spec.height, leanZ),
  ]);

  builder.tube({
    curve: stem,
    segments: 16,
    radial: 6,
    radius: (u) => (0.019 - 0.009 * u) * s,
    meta,
    glow: 0.01,
  });

  for (const at of [0.3, 0.58]) {
    const anchor = stem.getPoint(at);
    const leafMatrix = new THREE.Matrix4()
      .makeTranslation(anchor.x, anchor.y, anchor.z)
      .multiply(new THREE.Matrix4().makeRotationY(rand() * Math.PI * 2))
      .multiply(new THREE.Matrix4().makeRotationX(0.55 + rand() * 0.55));
    const leaf: PetalParams = {
      length: (0.3 + rand() * 0.16) * s,
      width: 0.05 * s,
      open: 1.0,
      cup: 0.55,
      ruffle: 0.16,
      twist: 0.7,
      bendPow: 1.4,
    };
    builder.surface({
      nu: 8,
      nv: 4,
      point: (u, v) => petalPoint(u, v, leaf).applyMatrix4(leafMatrix),
      meta,
      height: anchor.y / spec.height,
      flutter: (u) => u * u * 0.8,
      glow: 0.012,
    });
  }

  const tip = stem.getPoint(1);
  const tipHeight = Math.min(1, tip.y / spec.height);
  const orientation = new THREE.Quaternion()
    .setFromUnitVectors(UP, stem.getTangent(1).normalize())
    .multiply(new THREE.Quaternion().setFromAxisAngle(ACROSS, spec.nod))
    .multiply(new THREE.Quaternion().setFromAxisAngle(UP, spec.spin));
  const bloom = new THREE.Matrix4().compose(tip, orientation, new THREE.Vector3(1, 1, 1));

  const layers = spec.bud
    ? [
        { n: spec.petals, length: 0.29, width: 0.105, open: 0.2, cup: 0.95, lift: 0, offset: 0 },
        { n: spec.petals, length: 0.22, width: 0.085, open: 0.12, cup: 1.05, lift: 0.012, offset: 0.5 },
      ]
    : [
        { n: spec.petals, length: 0.37, width: 0.15, open: 0.94, cup: 0.55, lift: 0, offset: 0 },
        { n: spec.petals, length: 0.27, width: 0.115, open: 0.62, cup: 0.7, lift: 0.026, offset: 0.5 },
        { n: Math.max(3, spec.petals - 2), length: 0.155, width: 0.072, open: 0.3, cup: 0.9, lift: 0.042, offset: 0.25 },
      ];

  for (const layer of layers) {
    for (let i = 0; i < layer.n; i++) {
      const theta = ((i + layer.offset) / layer.n) * Math.PI * 2 + (rand() - 0.5) * 0.16;
      const matrix = bloom
        .clone()
        .multiply(new THREE.Matrix4().makeTranslation(0, layer.lift * s, 0))
        .multiply(new THREE.Matrix4().makeRotationY(theta));
      const params: PetalParams = {
        length: layer.length * s * (0.92 + rand() * 0.16),
        width: layer.width * s,
        open: layer.open * (0.92 + rand() * 0.16),
        cup: layer.cup,
        ruffle: 0.04 + rand() * 0.07,
        twist: (rand() - 0.5) * 0.4,
        bendPow: 1.25,
      };
      builder.surface({
        nu: 9,
        nv: 5,
        point: (u, v) => petalPoint(u, v, params).applyMatrix4(matrix),
        meta,
        height: tipHeight,
        flutter: (u) => u * u,
        glow: (u) => 0.014 + 0.06 * Math.pow(u, 3),
      });
    }
  }

  const coreMeta: PlantMeta = { ...meta, tint: spec.core };
  builder.merge({
    source: CORE_GEOMETRY,
    matrix: bloom.clone().scale(new THREE.Vector3(0.052 * s, 0.04 * s, 0.052 * s)),
    meta: coreMeta,
    height: tipHeight,
    glow: spec.bud ? 0.5 : 1.9,
  });

  if (spec.bud) return;

  const stamens = 5;
  for (let i = 0; i < stamens; i++) {
    const a = (i / stamens) * Math.PI * 2 + rand() * 0.4;
    const dir = new THREE.Vector3(Math.cos(a) * 0.42, 1, Math.sin(a) * 0.42).normalize();
    const length = (0.07 + rand() * 0.03) * s;
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.02 * s, 0),
      dir.clone().multiplyScalar(length * 0.6),
      dir.clone().multiplyScalar(length),
    ].map((p) => p.applyMatrix4(bloom)));

    builder.tube({
      curve: path,
      segments: 4,
      radial: 4,
      radius: () => 0.0035 * s,
      meta: coreMeta,
      height: tipHeight,
      flutter: (u) => u * 1.6,
      glow: 0.9,
    });

    builder.merge({
      source: TIP_GEOMETRY,
      matrix: bloom
        .clone()
        .multiply(new THREE.Matrix4().makeTranslation(dir.x * length, dir.y * length, dir.z * length))
        .scale(new THREE.Vector3(0.011 * s, 0.011 * s, 0.011 * s)),
      meta: coreMeta,
      height: tipHeight,
      flutter: 1.6,
      glow: 3.4,
    });
  }
}

const CORE_GEOMETRY = new THREE.IcosahedronGeometry(1, 1);
const TIP_GEOMETRY = new THREE.IcosahedronGeometry(1, 0);

export function buildFlowerField(specs: FlowerSpec[]) {
  const builder = new PlantBuilder();
  const rand = rng(1337);
  for (const spec of specs) buildFlower(builder, spec, rand);
  return builder.toGeometry();
}

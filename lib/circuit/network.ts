import * as THREE from 'three';

export type CircuitNode = {
  id: number;
  x: number;
  z: number;
  kind: 'pad' | 'via' | 'cap' | 'hub';
  radius: number;
};

export type CircuitEdge = {
  a: number;
  b: number;
  /** Orthogonal waypoints including endpoints, in xz. */
  path: Array<[number, number]>;
};

export type GearSpec = {
  x: number;
  z: number;
  /** Half-height so the gear sits on the board, not floating. */
  y: number;
  radius: number;
  teeth: number;
  thickness: number;
  rpm: number;
  phase: number;
  tint: 'ice' | 'circuit' | 'pulse';
};

export type PillarSpec = {
  x: number;
  z: number;
  radius: number;
  height: number;
  amp: number;
  speed: number;
  phase: number;
  edgeSpeed: number;
  accent: 'circuit' | 'pulse';
};

export type ChipSpec = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotation: number;
  phase: number;
  flowSpeed: number;
  pins: number;
  accent: 'circuit' | 'pulse';
};

export type CircuitNetwork = {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  gears: GearSpec[];
  pillars: PillarSpec[];
  chips: ChipSpec[];
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

/** True when a point sits in the calm typography corridor. */
function inClearing(x: number, z: number) {
  return Math.abs(x) < 3.4 && z > -1.2 && z < 4.2;
}

function manhattan(ax: number, az: number, bx: number, bz: number, bend: number): Array<[number, number]> {
  if (Math.abs(ax - bx) < 0.05 || Math.abs(az - bz) < 0.05) {
    return [
      [ax, az],
      [bx, bz],
    ];
  }
  // Prefer a single elbow; bend chooses whether X or Z turns first.
  if (bend > 0.5) {
    return [
      [ax, az],
      [bx, az],
      [bx, bz],
    ];
  }
  return [
    [ax, az],
    [ax, bz],
    [bx, bz],
  ];
}

/**
 * Builds an edge-weighted PCB: dense pads, glass gears, Tron pillars and silicon
 * dies around the frame, with a clear corridor up the middle for the headline.
 */
export function buildCircuitNetwork(
  nodeBudget: number,
  gearBudget: number,
  pillarBudget = 8,
  chipBudget = 10,
  seed = 41,
): CircuitNetwork {
  const rand = rng(seed);
  const nodes: CircuitNode[] = [];

  const rings: Array<{ count: number; r: [number, number]; zBias: number }> = [
    { count: Math.floor(nodeBudget * 0.28), r: [5.2, 7.4], zBias: 0.2 },
    { count: Math.floor(nodeBudget * 0.34), r: [7.0, 10.2], zBias: -0.4 },
    { count: Math.floor(nodeBudget * 0.22), r: [4.0, 6.0], zBias: 1.8 },
    { count: nodeBudget, r: [8.5, 12.5], zBias: -1.2 },
  ];

  let id = 0;
  for (const ring of rings) {
    let placed = 0;
    let guard = 0;
    while (placed < ring.count && guard < ring.count * 40) {
      guard += 1;
      const angle = rand() * Math.PI * 2;
      const radius = THREE.MathUtils.lerp(ring.r[0], ring.r[1], rand());
      const x = Math.cos(angle) * radius * (0.85 + rand() * 0.35);
      const z = Math.sin(angle) * radius * 0.72 + ring.zBias;
      if (inClearing(x, z)) continue;
      if (nodes.some((n) => (n.x - x) ** 2 + (n.z - z) ** 2 < 0.55)) continue;

      const roll = rand();
      const kind: CircuitNode['kind'] = roll < 0.12 ? 'hub' : roll < 0.4 ? 'cap' : roll < 0.7 ? 'via' : 'pad';
      nodes.push({
        id: id++,
        x,
        z,
        kind,
        radius: kind === 'hub' ? 0.14 : kind === 'cap' ? 0.09 : 0.055 + rand() * 0.03,
      });
      placed += 1;
    }
  }

  // Corner anchors so the board reads as framed, not a random spray.
  const anchors: Array<[number, number]> = [
    [-8.4, -3.2],
    [8.6, -3.4],
    [-7.2, 5.6],
    [7.4, 5.4],
    [-10.2, 1.2],
    [10.4, 0.8],
    [0, -4.8],
    [-4.8, -4.2],
    [4.9, -4.3],
  ];
  for (const [x, z] of anchors) {
    if (nodes.some((n) => (n.x - x) ** 2 + (n.z - z) ** 2 < 0.4)) continue;
    nodes.push({ id: id++, x, z, kind: 'hub', radius: 0.12 });
  }

  const edges: CircuitEdge[] = [];
  const linked = new Set<string>();

  const link = (a: number, b: number) => {
    if (a === b) return;
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (linked.has(key)) return;
    linked.add(key);
    const na = nodes[a];
    const nb = nodes[b];
    edges.push({
      a,
      b,
      path: manhattan(na.x, na.z, nb.x, nb.z, rand()),
    });
  };

  // k-nearest neighbour mesh
  for (let i = 0; i < nodes.length; i++) {
    const ranked = nodes
      .map((n, j) => ({ j, d: (n.x - nodes[i].x) ** 2 + (n.z - nodes[i].z) ** 2 }))
      .filter((entry) => entry.j !== i)
      .sort((a, b) => a.d - b.d);
    const degree = nodes[i].kind === 'hub' ? 4 : 2 + Math.floor(rand() * 2);
    for (let k = 0; k < degree && k < ranked.length; k++) {
      if (ranked[k].d > 28) break;
      link(i, ranked[k].j);
    }
  }

  // A few long haul buses around the clearing, never through it.
  for (let i = 0; i < 10; i++) {
    const a = Math.floor(rand() * nodes.length);
    const b = Math.floor(rand() * nodes.length);
    const midX = (nodes[a].x + nodes[b].x) * 0.5;
    const midZ = (nodes[a].z + nodes[b].z) * 0.5;
    if (inClearing(midX, midZ)) continue;
    if ((nodes[a].x - nodes[b].x) ** 2 + (nodes[a].z - nodes[b].z) ** 2 < 20) continue;
    link(a, b);
  }

  const gears: GearSpec[] = [];
  const gearSites: Array<[number, number]> = [
    [-6.8, -2.6],
    [-5.4, -1.4],
    [6.6, -2.8],
    [5.2, -1.2],
    [-7.6, 3.8],
    [7.8, 3.6],
    [-4.2, 5.4],
    [4.4, 5.2],
    [-9.2, 0.6],
    [9.4, 0.4],
  ];
  const tints: GearSpec['tint'][] = ['ice', 'circuit', 'pulse'];

  for (let i = 0; i < Math.min(gearBudget, gearSites.length); i++) {
    const [x, z] = gearSites[i];
    const radius = 0.55 + rand() * 0.75;
    const thickness = 0.1 + rand() * 0.06;
    gears.push({
      x,
      z,
      y: thickness * 0.5 + 0.012,
      radius,
      teeth: 10 + Math.floor(rand() * 10),
      thickness,
      rpm: (0.85 + rand() * 1.1) * (rand() > 0.5 ? 1 : -1),
      phase: rand() * Math.PI * 2,
      tint: tints[i % tints.length],
    });
  }

  const extras = Math.min(gearBudget - gears.length, 4);
  for (let i = 0; i < extras; i++) {
    const host = gears[i];
    if (!host) break;
    const side = i % 2 === 0 ? 1 : -1;
    const radius = host.radius * 0.42;
    const thickness = host.thickness * 0.85;
    gears.push({
      x: host.x + side * (host.radius * 0.82),
      z: host.z + host.radius * 0.28,
      y: thickness * 0.5 + 0.012,
      radius,
      teeth: 8 + Math.floor(rand() * 6),
      thickness,
      rpm: -host.rpm * (host.radius / radius),
      phase: host.phase + 0.2,
      tint: host.tint === 'circuit' ? 'ice' : 'circuit',
    });
  }

  const pillars: PillarSpec[] = [];
  // Procedural ring so we can place dozens without hand-listing coordinates.
  let pillarGuard = 0;
  while (pillars.length < pillarBudget && pillarGuard < pillarBudget * 50) {
    pillarGuard += 1;
    const angle = rand() * Math.PI * 2;
    const radius = 4.8 + rand() * 8.5;
    const x = Math.cos(angle) * radius * (0.9 + rand() * 0.35);
    const z = Math.sin(angle) * radius * 0.75 + (rand() - 0.4) * 2.4;
    if (inClearing(x, z)) continue;
    if (pillars.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < 0.85)) continue;
    pillars.push({
      x,
      z,
      radius: 0.09 + rand() * 0.12,
      height: 0.45 + rand() * 1.35,
      amp: 0.1 + rand() * 0.28,
      speed: 0.18 + rand() * 0.35,
      phase: rand() * Math.PI * 2,
      edgeSpeed: 0.3 + rand() * 0.65,
      accent: pillars.length % 3 === 0 ? 'pulse' : 'circuit',
    });
  }

  const chips: ChipSpec[] = [];
  const chipSites: Array<[number, number, number]> = [
    [-7.1, -0.2, 0.35],
    [7.3, -0.4, -0.4],
    [-5.0, 3.2, 0.55],
    [5.2, 3.0, -0.2],
    [-9.0, 3.2, 0.1],
    [9.2, 3.0, -0.55],
    [-4.6, -3.6, 0.8],
    [4.8, -3.4, -0.7],
    [-8.4, 5.0, 0.2],
    [8.6, 4.8, -0.25],
    [-2.8, 5.8, 0.15],
    [2.9, 5.7, -0.1],
  ];
  for (let i = 0; i < Math.min(chipBudget, chipSites.length); i++) {
    const [x, z, rotation] = chipSites[i];
    if (inClearing(x, z)) continue;
    const width = 0.55 + rand() * 0.7;
    const depth = 0.35 + rand() * 0.45;
    chips.push({
      x,
      z,
      width,
      depth,
      height: 0.07 + rand() * 0.05,
      rotation,
      phase: rand() * Math.PI * 2,
      flowSpeed: 0.35 + rand() * 0.45,
      pins: 4 + Math.floor(rand() * 5),
      accent: i % 2 === 0 ? 'circuit' : 'pulse',
    });
  }

  return { nodes, edges, gears, pillars, chips };
}

/** Expands orthogonal paths into a ribbon mesh for the trace shader. */
export function buildTraceGeometry(edges: CircuitEdge[], halfWidth = 0.028) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const along: number[] = [];
  const indices: number[] = [];

  let run = 0;

  for (const edge of edges) {
    for (let i = 0; i < edge.path.length - 1; i++) {
      const [ax, az] = edge.path[i];
      const [bx, bz] = edge.path[i + 1];
      const dx = bx - ax;
      const dz = bz - az;
      const len = Math.hypot(dx, dz) || 1e-5;
      const nx = (-dz / len) * halfWidth;
      const nz = (dx / len) * halfWidth;

      const a0 = positions.length / 3;
      positions.push(ax - nx, 0.02, az - nz, ax + nx, 0.02, az + nz, bx - nx, 0.02, bz - nz, bx + nx, 0.02, bz + nz);
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      along.push(run, run, run + len, run + len);
      indices.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2);
      run += len;
    }
    run += 0.35;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute('aAlong', new THREE.Float32BufferAttribute(along, 1));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function buildGearShape(teeth: number, radius: number) {
  const shape = new THREE.Shape();
  const root = radius * 0.72;
  const tip = radius;
  const steps = teeth * 2;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = i % 2 === 0 ? tip : root;
    const x = Math.cos(t) * r;
    const y = Math.sin(t) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, radius * 0.18, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

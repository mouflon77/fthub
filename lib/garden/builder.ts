import * as THREE from 'three';

export type PlantMeta = {
  /** World position of the plant base. The wind field is sampled here. */
  base: THREE.Vector3;
  /** Per-plant randomiser, drives phase offsets and stiffness variation. */
  seed: number;
  /** Absorption colour of the glass. */
  tint: THREE.Color;
  /** Used to normalise vertex height into the 0..1 bend weight. */
  height: number;
};

type HeightArg = number | ((u: number, v: number) => number);
type ScalarArg = number | ((u: number, v: number) => number);

const resolve = (arg: ScalarArg, u: number, v: number) => (typeof arg === 'number' ? arg : arg(u, v));

/**
 * Accumulates procedural plant parts into a single interleaved geometry.
 * Everything the garden grows ends up in one draw call, with the per-plant
 * data carried on vertex attributes so the wind can be evaluated on the GPU.
 */
export class PlantBuilder {
  private position: number[] = [];
  private uv: number[] = [];
  private index: number[] = [];
  private aBase: number[] = [];
  private aHeight: number[] = [];
  private aSeed: number[] = [];
  private aTint: number[] = [];
  private aFlutter: number[] = [];
  private aGlow: number[] = [];

  private get count() {
    return this.position.length / 3;
  }

  private vertex(
    p: THREE.Vector3,
    u: number,
    v: number,
    meta: PlantMeta,
    height: number,
    flutter: number,
    glow: number,
  ) {
    this.position.push(p.x, p.y, p.z);
    this.uv.push(u, v);
    this.aBase.push(meta.base.x, meta.base.y, meta.base.z);
    this.aHeight.push(THREE.MathUtils.clamp(height, 0, 1));
    this.aSeed.push(meta.seed);
    this.aTint.push(meta.tint.r, meta.tint.g, meta.tint.b);
    this.aFlutter.push(flutter);
    this.aGlow.push(glow);
  }

  /**
   * Adds a parametric patch. `point` is evaluated in plant space, where the
   * origin is the plant base and +Y is up.
   */
  surface(opts: {
    nu: number;
    nv: number;
    point: (u: number, v: number) => THREE.Vector3;
    meta: PlantMeta;
    /** Bend weight. Pass a constant to make a part swing as one rigid piece. */
    height: HeightArg;
    flutter?: ScalarArg;
    glow?: ScalarArg;
  }) {
    const { nu, nv, point, meta } = opts;
    const start = this.count;

    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      for (let j = 0; j <= nv; j++) {
        const v = j / nv;
        this.vertex(
          point(u, v),
          u,
          v,
          meta,
          resolve(opts.height, u, v),
          resolve(opts.flutter ?? 0, u, v),
          resolve(opts.glow ?? 0, u, v),
        );
      }
    }

    const stride = nv + 1;
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const a = start + i * stride + j;
        const b = a + 1;
        const c = a + stride;
        const d = c + 1;
        this.index.push(a, c, b, b, c, d);
      }
    }
  }

  /**
   * Adds a closed tube by sweeping a circular cross-section along a curve.
   * Radius varies with the curve parameter, which is what keeps stems tapered.
   */
  tube(opts: {
    curve: THREE.Curve<THREE.Vector3>;
    segments: number;
    radial: number;
    radius: (u: number) => number;
    meta: PlantMeta;
    height?: HeightArg;
    flutter?: ScalarArg;
    glow?: ScalarArg;
  }) {
    const { curve, segments, radial, radius, meta } = opts;
    const frames = curve.computeFrenetFrames(segments, false);
    const start = this.count;
    const p = new THREE.Vector3();

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const center = curve.getPoint(u);
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];
      const r = radius(u);

      for (let j = 0; j <= radial; j++) {
        const v = j / radial;
        const angle = v * Math.PI * 2;
        p.copy(center)
          .addScaledVector(normal, Math.cos(angle) * r)
          .addScaledVector(binormal, Math.sin(angle) * r);
        const height = opts.height === undefined ? center.y / meta.height : resolve(opts.height, u, v);
        this.vertex(p, u, v, meta, height, resolve(opts.flutter ?? 0, u, v), resolve(opts.glow ?? 0, u, v));
      }
    }

    const stride = radial + 1;
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radial; j++) {
        const a = start + i * stride + j;
        const b = a + 1;
        const c = a + stride;
        const d = c + 1;
        this.index.push(a, c, b, b, c, d);
      }
    }
  }

  /** Folds an existing geometry (cores, stamen tips) into the same buffer. */
  merge(opts: {
    source: THREE.BufferGeometry;
    matrix: THREE.Matrix4;
    meta: PlantMeta;
    height: number;
    flutter?: number;
    glow?: number;
  }) {
    const { source, matrix, meta } = opts;
    const src = source.getAttribute('position') as THREE.BufferAttribute;
    const srcIndex = source.getIndex();
    const start = this.count;
    const p = new THREE.Vector3();

    for (let i = 0; i < src.count; i++) {
      p.fromBufferAttribute(src, i).applyMatrix4(matrix);
      this.vertex(p, 0.5, 0.5, meta, opts.height, opts.flutter ?? 0, opts.glow ?? 0);
    }

    if (srcIndex) {
      for (let i = 0; i < srcIndex.count; i++) this.index.push(start + srcIndex.getX(i));
    } else {
      for (let i = 0; i < src.count; i++) this.index.push(start + i);
    }
  }

  toGeometry() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.position, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    geometry.setAttribute('aBase', new THREE.Float32BufferAttribute(this.aBase, 3));
    geometry.setAttribute('aHeight', new THREE.Float32BufferAttribute(this.aHeight, 1));
    geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(this.aSeed, 1));
    geometry.setAttribute('aTint', new THREE.Float32BufferAttribute(this.aTint, 3));
    geometry.setAttribute('aFlutter', new THREE.Float32BufferAttribute(this.aFlutter, 1));
    geometry.setAttribute('aGlow', new THREE.Float32BufferAttribute(this.aGlow, 1));
    geometry.setIndex(
      this.count > 65535
        ? new THREE.Uint32BufferAttribute(this.index, 1)
        : new THREE.Uint16BufferAttribute(this.index, 1),
    );
    geometry.computeVertexNormals();
    // Positions are plant-local; the shader adds aBase. Bounds must cover the
    // whole field or the field gets frustum-culled the moment it leaves origin.
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 40);
    return geometry;
  }
}

/** Deterministic RNG so the garden is identical on every load. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

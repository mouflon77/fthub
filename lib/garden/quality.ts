export type Quality = {
  tier: 'high' | 'mid' | 'low';
  flowers: number;
  grass: number;
  fireflies: number;
  beams: number;
  dpr: [number, number];
  bloom: boolean;
  smaa: boolean;
};

const PRESETS: Record<Quality['tier'], Quality> = {
  high: { tier: 'high', flowers: 36, grass: 6800, fireflies: 520, beams: 3, dpr: [1, 1.75], bloom: true, smaa: true },
  mid: { tier: 'mid', flowers: 22, grass: 3400, fireflies: 300, beams: 2, dpr: [1, 1.5], bloom: true, smaa: false },
  // Bloom stays on even here: without it the glass loses its glow and the whole
  // scene reads as flat plastic. Vertex counts are what get cut instead.
  low: { tier: 'low', flowers: 14, grass: 1600, fireflies: 150, beams: 1, dpr: [1, 1.3], bloom: true, smaa: false },
};

export function detectQuality(): Quality {
  if (typeof window === 'undefined') return PRESETS.mid;

  const cores = navigator.hardwareConcurrency ?? 4;
  const width = window.innerWidth;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  if (width < 700 || cores <= 4) return PRESETS.low;
  if (width < 1200 || cores <= 8 || coarse) return PRESETS.mid;
  return PRESETS.high;
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

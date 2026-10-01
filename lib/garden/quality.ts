export type Quality = {
  tier: 'high' | 'mid' | 'low';
  nodes: number;
  gears: number;
  pillars: number;
  chips: number;
  towers: number;
  dpr: [number, number];
  bloom: boolean;
  smaa: boolean;
};

const PRESETS: Record<Quality['tier'], Quality> = {
  high: {
    tier: 'high',
    nodes: 96,
    gears: 12,
    pillars: 48,
    chips: 12,
    towers: 90,
    dpr: [1, 1.75],
    bloom: true,
    smaa: true,
  },
  mid: {
    tier: 'mid',
    nodes: 64,
    gears: 8,
    pillars: 32,
    chips: 8,
    towers: 60,
    dpr: [1, 1.5],
    bloom: true,
    smaa: false,
  },
  low: {
    tier: 'low',
    nodes: 40,
    gears: 5,
    pillars: 20,
    chips: 5,
    towers: 36,
    dpr: [1, 1.3],
    bloom: true,
    smaa: false,
  },
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

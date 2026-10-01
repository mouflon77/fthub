/** Brand locks shared by CSS tokens and the WebGL scene. */
export const brand = {
  /** Warm paper field behind the board. */
  ice: '#f7f6f0',
  iceDeep: '#ebe8df',
  mist: '#fafaf5',
  /** Deep forest ink — primary UI + circuit glow. */
  circuit: '#0d2119',
  circuitSoft: '#1a3a2e',
  /** Lime pulse highlight. */
  pulse: '#d8ef56',
  pulseSoft: '#e6f88e',
  metal: '#7a8a80',
  metalBright: '#c5cfc8',
  brass: '#8a9a6e',
  brassDark: '#4a5a40',
  ink: '#0d2119',
  cream: '#f7f6f0',
  lime: '#d8ef56',
  forest: '#0d2119',
} as const;

export function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const n = Number.parseInt(value, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255) as [number, number, number];
}

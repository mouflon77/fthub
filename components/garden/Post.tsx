'use client';

import { Bloom, ChromaticAberration, EffectComposer, Noise, SMAA, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/**
 * Bloom is doing the heavy lifting: the glass speculars and flower cores are
 * written well above 1.0 so they blow out into glow exactly where real glass
 * would catch the light.
 */
export function Post({ smaa }: { smaa: boolean }) {
  return (
    <EffectComposer multisampling={0}>
      {/* Stems and blades are one or two pixels wide; without this they crawl. */}
      {smaa ? <SMAA /> : <></>}
      <Bloom intensity={0.85} luminanceThreshold={1.12} luminanceSmoothing={0.22} radius={0.62} mipmapBlur />
      <ChromaticAberration offset={[0.00035, 0.00055]} />
      <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.05} premultiply />
      <Vignette offset={0.42} darkness={0.18} />
    </EffectComposer>
  );
}

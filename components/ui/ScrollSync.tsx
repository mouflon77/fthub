'use client';

import { useEffect } from 'react';
import { viewState } from '@/lib/garden/state';

/**
 * Single source of scroll truth: the camera rig reads it to pull back, and the
 * veil reads it to frost the garden once copy is on top of it.
 */
export function ScrollSync() {
  useEffect(() => {
    let frame = 0;

    const apply = () => {
      frame = 0;
      const progress = window.scrollY / Math.max(window.innerHeight, 1);
      viewState.scroll = progress;
      const veil = Math.min(0.9, Math.max(0, (progress - 0.3) * 1.3));
      document.documentElement.style.setProperty('--veil', veil.toFixed(3));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return null;
}

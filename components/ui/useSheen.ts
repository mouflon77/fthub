'use client';

import { useEffect, useRef } from 'react';

/**
 * Feeds the cursor position into --mx / --my so the `.sheen` highlight tracks
 * the pointer across a glass surface, the way a real one catches a light.
 */
export function useSheen<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      node.style.setProperty('--mx', `${event.clientX - box.left}px`);
      node.style.setProperty('--my', `${event.clientY - box.top}px`);
    };

    node.addEventListener('pointermove', move, { passive: true });
    return () => node.removeEventListener('pointermove', move);
  }, []);

  return ref;
}

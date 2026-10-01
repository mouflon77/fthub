'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Logo } from './Logo';

/**
 * Building the board is a burst of geometry on first paint,
 * so the wait gets a branded curtain rather than a blank frame.
 */
export function Loader({ done }: { done: boolean }) {
  const [crawl, setCrawl] = useState(8);
  const [removed, setRemoved] = useState(false);
  const progress = done ? 100 : crawl;

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => {
      setCrawl((value) => Math.min(value + 4 + Math.random() * 9, 92));
    }, 190);
    return () => window.clearInterval(id);
  }, [done]);

  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setRemoved(true), 1100);
    return () => window.clearTimeout(id);
  }, [done]);

  if (removed) return null;

  return (
    <div className="loader" data-done={done} role="status" aria-live="polite">
      <Logo className="loader-mark" />
      <div className="loader-bar">
        <i style={{ '--p': `${progress}%` } as CSSProperties} />
      </div>
      <span className="loader-text">{done ? 'ready' : 'routing the board'}</span>
    </div>
  );
}

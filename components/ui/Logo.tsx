'use client';

import { useId } from 'react';

// Two capsule strands crossed at 45 degrees. Their inner edges bound the
// diamond void in the middle of the mark.
const STRAND = { x: 15, y: 31, width: 70, height: 38, rx: 19 } as const;
// Where the strands cross: 19 * sqrt(2) out along each axis from centre.
const CROSS = 26.87;

const StrandA = () => <rect {...STRAND} transform="rotate(-45 50 50)" />;
const StrandB = () => <rect {...STRAND} transform="rotate(45 50 50)" />;

const Both = () => (
  <>
    <StrandA />
    <StrandB />
  </>
);

type LogoProps = {
  className?: string;
  /** `glass` is the frosted brand mark, `line` is a flat single-colour version. */
  variant?: 'glass' | 'line';
  title?: string;
};

/**
 * The Frontier Tech Hub mark, rebuilt as vector so it can be lit rather than
 * pasted on. The supplied artwork is solid black; this version is lit ice.
 */
export function Logo({ className, variant = 'glass', title }: LogoProps) {
  const id = useId().replace(/:/g, '');

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {variant === 'line' ? (
        <g fill="none" stroke="currentColor" strokeWidth={11} strokeLinecap="round">
          <Both />
        </g>
      ) : (
        <>
          <defs>
            <linearGradient id={`${id}-strand`} x1="12" y1="8" x2="88" y2="94" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="0.42" stopColor="#e0f2fe" stopOpacity="0.58" />
              <stop offset="1" stopColor="#007aff" stopOpacity="0.62" />
            </linearGradient>
            <linearGradient id={`${id}-sweep`} x1="10" y1="6" x2="72" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="0.72" stopColor="#000000" />
            </linearGradient>
            <mask id={`${id}-specular`}>
              <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-sweep)`} />
            </mask>
            {/* Reveals only the two side crossings, so one strand weaves over
                the other there and under it at top and bottom. */}
            <mask id={`${id}-weave`}>
              <rect x="0" y="0" width="100" height="100" fill="#000" />
              <circle cx={50 - CROSS} cy="50" r="11" fill="#fff" />
              <circle cx={50 + CROSS} cy="50" r="11" fill="#fff" />
            </mask>
            <filter id={`${id}-glow`} x="-35%" y="-35%" width="170%" height="170%">
              <feGaussianBlur stdDeviation="3.4" />
            </filter>
          </defs>

          <g fill="none" strokeWidth={11} strokeLinecap="round">
            <g stroke="#2b8cff" opacity="0.55" filter={`url(#${id}-glow)`}>
              <Both />
            </g>
            <g stroke={`url(#${id}-strand)`}>
              <Both />
            </g>
            <g stroke={`url(#${id}-strand)`} mask={`url(#${id}-weave)`}>
              <StrandA />
            </g>
            <g stroke="#ffffff" opacity="0.6" mask={`url(#${id}-specular)`}>
              <Both />
            </g>
          </g>
        </>
      )}
    </svg>
  );
}

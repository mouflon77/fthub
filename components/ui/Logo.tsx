'use client';

type LogoProps = {
  className?: string;
  /** `glass` adds blue / orange rim light; `line` is flat currentColor ink. */
  variant?: 'glass' | 'line';
  title?: string;
};

/**
 * Official Frontier Tech Hub mark (interlocking capsule loops).
 * Uses the supplied artwork so proportions and weave stay exact.
 */
export function Logo({ className, variant = 'glass', title }: LogoProps) {
  if (variant === 'line') {
    return (
      <img
        className={className}
        src="/brand-mark.png"
        alt={title ?? ''}
        aria-hidden={title ? undefined : true}
        draggable={false}
        style={{ filter: 'brightness(0)', opacity: 0.92 }}
      />
    );
  }

  return (
    <span className={className ? `logo-mark ${className}` : 'logo-mark'} role="img" aria-label={title} aria-hidden={title ? undefined : true}>
      <img src="/brand-mark.png" alt="" draggable={false} />
    </span>
  );
}

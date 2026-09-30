type IconProps = { className?: string };

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const ArrowRight = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M2.5 8h11M9.5 4l4 4-4 4" />
  </svg>
);

export const ArrowUpRight = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4.5 11.5l7-7M6 4.5h5.5V10" />
  </svg>
);

const mark = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': true,
};

export const IconLinkedIn = ({ className }: IconProps) => (
  <svg {...mark} className={className}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z" />
  </svg>
);

export const IconX = ({ className }: IconProps) => (
  <svg {...mark} className={className}>
    <path d="M18.24 2.25h3.32l-7.26 8.3 8.54 11.2h-6.68l-5.23-6.84-5.99 6.84H1.62l7.77-8.88L1.25 2.25h6.85l4.73 6.25 5.41-6.25Zm-1.16 17.52h1.84L7.01 4.13H5.04l12.04 15.64Z" />
  </svg>
);

export const IconTelegram = ({ className }: IconProps) => (
  <svg {...mark} className={className}>
    <path d="M11.94 2.03A10 10 0 1 0 22 12.06 10 10 0 0 0 11.94 2Zm4.6 6.83-1.55 7.3c-.12.52-.42.65-.86.4l-2.37-1.75-1.14 1.1c-.13.13-.23.23-.46.23l.16-2.4 4.38-3.96c.19-.17-.04-.26-.3-.1L8.3 13.3l-2.33-.73c-.5-.16-.51-.5.11-.74l9.1-3.5c.42-.16.79.1.66.53Z" />
  </svg>
);

export const Spark = ({ className }: IconProps) => (
  <svg {...base} className={className} width={13} height={13} viewBox="0 0 13 13">
    <path d="M6.5 1.5v10M1.5 6.5h10" />
  </svg>
);

export const Pin = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M8 14.5s5-4.2 5-7.7A5 5 0 0 0 3 6.8c0 3.5 5 7.7 5 7.7Z" />
    <circle cx="8" cy="6.6" r="1.8" />
  </svg>
);

import type { SocialLink } from '@/lib/site';
import { IconLinkedIn, IconTelegram, IconX } from './Icons';

const ICONS = {
  linkedin: IconLinkedIn,
  x: IconX,
  telegram: IconTelegram,
} as const;

export function SocialLinks({ links, labelledBy }: { links: readonly SocialLink[]; labelledBy?: string }) {
  if (!links.length) return null;

  return (
    <nav className="socials" aria-label="Social profiles" aria-labelledby={labelledBy}>
      {links.map((link) => {
        const Icon = ICONS[link.kind];
        return (
          <a
            key={link.href}
            className="social"
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={link.label}
          >
            <Icon />
          </a>
        );
      })}
    </nav>
  );
}

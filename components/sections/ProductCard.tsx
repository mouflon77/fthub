import type { ReactNode } from 'react';
import type { SocialLink } from '@/lib/site';
import { ArrowRight } from '@/components/ui/Icons';
import { SocialLinks } from '@/components/ui/SocialLinks';

export function ProductCard({
  status,
  name,
  claim,
  body,
  href,
  cta,
  socials,
  visual,
}: {
  status: string;
  name: string;
  claim?: string;
  body: string;
  href?: string;
  cta?: string;
  socials?: readonly SocialLink[];
  visual: ReactNode;
}) {
  return (
    <article className="product">
      {visual}
      <div className="product-copy">
        <div className="status">{status}</div>
        <h3>{name}</h3>
        {claim ? <div className="claim">{claim}</div> : null}
        <p>{body}</p>
        <div className="product-actions">
          {socials?.length ? <SocialLinks links={socials} /> : null}
          {href && cta ? (
            <a className="btn btn-primary" href={href} target="_blank" rel="noreferrer noopener">
              {cta}
              <span className="btn-chip" aria-hidden="true">
                <ArrowRight />
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

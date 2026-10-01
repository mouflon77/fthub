'use client';

import { useEffect, useState } from 'react';
import { nav, site } from '@/lib/site';
import { ArrowRight } from './Icons';
import { Logo } from './Logo';

const IDS = ['top', ...nav.map((item) => item.href.replace('#', '')), 'contact'];

export function Header() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    let frame = 0;

    const pick = () => {
      frame = 0;
      // Whichever section is nearest the reading line, a third down the page.
      const line = window.innerHeight * 0.34;
      let best = IDS[0];
      let bestDistance = Infinity;

      for (const id of IDS) {
        const node = document.getElementById(id);
        if (!node) continue;
        const distance = Math.abs(node.getBoundingClientRect().top - line);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = id;
        }
      }

      setActive(best);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };

    pick();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <a className="brand glass" href="#top">
          <Logo className="brand-mark" title={`${site.name} home`} />
          <span className="brand-name">Frontier Tech Hub</span>
        </a>

        <nav className="navpill glass" aria-label="Sections">
          {nav.map((item) => (
            <a
              key={item.href}
              className="navlink"
              href={item.href}
              data-active={active === item.href.replace('#', '')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a className="btn btn-primary header-cta" href="#contact">
          Get in touch
          <span className="btn-chip" aria-hidden="true">
            <ArrowRight />
          </span>
        </a>
      </div>
    </header>
  );
}

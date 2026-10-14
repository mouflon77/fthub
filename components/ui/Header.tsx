'use client';

import { useEffect, useState } from 'react';
import { contact, nav, site } from '@/lib/site';
import { ArrowRight } from './Icons';
import { Logo } from './Logo';

const IDS = ['top', ...nav.map((item) => item.href.replace('#', ''))];

export function Header() {
  const [active, setActive] = useState('top');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let frame = 0;

    const pick = () => {
      frame = 0;
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

  useEffect(() => {
    const close = () => {
      if (window.innerWidth > 850) setOpen(false);
    };
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || target.closest('.header')) return;
      setOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="header">
      <div className="header-inner">
        <a className="logo" href="#top">
          <Logo className="brand-mark" title={`${site.name} home`} />
          <span className="brand-name">{site.name}</span>
        </a>

        <button
          className="menu-toggle glass"
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <img className="menu-icon" src="/menu.png" alt="" />
        </button>

        <nav id="site-menu" className={`navpill glass${open ? ' is-open' : ''}`} aria-label="Sections">
          {nav.map((item) => (
            <a
              key={item.href}
              className="navlink"
              href={item.href}
              data-active={active === item.href.replace('#', '')}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a className="btn btn-primary nav-cta" href={contact.headerCta.href} onClick={() => setOpen(false)}>
            {contact.headerCta.label}
            <span className="btn-chip" aria-hidden="true">
              <ArrowRight />
            </span>
          </a>
        </nav>

        <a className="btn btn-primary header-cta" href={contact.headerCta.href}>
          {contact.headerCta.label}
          <span className="btn-chip" aria-hidden="true">
            <ArrowRight />
          </span>
        </a>
      </div>
    </header>
  );
}

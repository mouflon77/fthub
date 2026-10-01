import { hero } from '@/lib/site';
import { ArrowRight } from '@/components/ui/Icons';

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <h1 id="hero-title" className="rise" style={{ '--rise-delay': '80ms' } as React.CSSProperties}>
          {hero.heading}
        </h1>

        <div className="hero-copy rise" style={{ '--rise-delay': '180ms' } as React.CSSProperties}>
          <p className="hero-intro">{hero.intro}</p>
          <p className="hero-sub">{hero.body}</p>
        </div>

        <div className="hero-actions rise" style={{ '--rise-delay': '280ms' } as React.CSSProperties}>
          <a className="btn btn-primary" href={hero.primary.href}>
            {hero.primary.label}
            <span className="btn-chip" aria-hidden="true">
              <ArrowRight />
            </span>
          </a>
          <a className="btn btn-link" href={hero.secondary.href}>
            {hero.secondary.label}
            <ArrowRight className="btn-arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}

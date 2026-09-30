import { site } from '@/lib/site';
import { ArrowRight } from '@/components/ui/Icons';

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <p className="hero-badge glass rise" style={{ '--rise-delay': '420ms' } as React.CSSProperties}>
          <span className="hero-dot" aria-hidden="true" />
          Studio · London
        </p>

        <h1 id="hero-title" className="rise" style={{ '--rise-delay': '540ms' } as React.CSSProperties}>
          We build the <em>intelligent tools</em> that build the future.
        </h1>

        <p className="hero-sub rise" style={{ '--rise-delay': '680ms' } as React.CSSProperties}>
          {site.description}
        </p>

        <div className="hero-actions rise" style={{ '--rise-delay': '820ms' } as React.CSSProperties}>
          <a className="btn btn-primary" href="#work">
            See our work
            <ArrowRight className="btn-arrow" />
          </a>
          <a className="btn" href="#about">
            What we do
          </a>
        </div>
      </div>

      <div className="hero-foot rise" style={{ '--rise-delay': '1000ms' } as React.CSSProperties}>
        <p className="hero-hint">
          <b>Move</b> to stir the air <span aria-hidden="true">·</span> <b>click</b> for a gust
        </p>
        <div className="scrollcue" aria-hidden="true">
          <i />
          Scroll
        </div>
      </div>
    </section>
  );
}

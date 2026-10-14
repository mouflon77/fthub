import { hero } from '@/lib/site';
import { ArrowRight } from '@/components/ui/Icons';

export function Hero() {
  return (
    <section className="hero wrap">
      <div className="eyebrow">{hero.eyebrow}</div>
      <h1>{hero.heading}</h1>
      <p>{hero.body}</p>
      <div className="actions">
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
    </section>
  );
}

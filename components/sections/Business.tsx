import { business } from '@/lib/site';
import { ArrowRight } from '@/components/ui/Icons';

export function Business() {
  return (
    <section className="section wrap">
      <div className="business">
        <div>
          <div className="eyebrow">{business.eyebrow}</div>
          <h2>{business.heading}</h2>
          <p className="lede">{business.lede}</p>
          <p className="business-cta">
            <a className="btn btn-primary" href={business.cta.href}>
              {business.cta.label}
              <span className="btn-chip" aria-hidden="true">
                <ArrowRight />
              </span>
            </a>
          </p>
        </div>
        <div className="business-list">
          {business.items.map((item) => (
            <div className="business-item" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

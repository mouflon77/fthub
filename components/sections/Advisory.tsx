import { advisory } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight, Spark } from '@/components/ui/Icons';

export function Advisory() {
  return (
    <section className="section" id="advisory" aria-labelledby="advisory-title">
      <div className="shell">
        <Reveal>
          <div className="section-head section-head-wide">
            <span className="eyebrow">{advisory.eyebrow}</span>
            <h2 id="advisory-title" className="h2">
              {advisory.heading}
            </h2>
            <p className="lede">{advisory.lede}</p>
            {advisory.paragraphs.map((paragraph) => (
              <p className="lede" key={paragraph.slice(0, 32)}>
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <div className="services">
          {advisory.services.map((service, index) => (
            <Reveal key={service.title} delay={index * 100}>
              <article className="service glass">
                <span className="service-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="service-copy">
                  <h3>{service.title}</h3>
                  <p className="service-intro">{service.intro}</p>
                  <p>{service.body}</p>
                  {'pointsHeading' in service && service.pointsHeading ? (
                    <p className="service-points-label">{service.pointsHeading}</p>
                  ) : null}
                  <ul className="service-points">
                    {service.points.map((point) => (
                      <li key={point}>
                        <Spark />
                        {point}
                      </li>
                    ))}
                  </ul>
                  {service.outro ? <p className="service-outro">{service.outro}</p> : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="section-cta">
            <a className="btn btn-primary" href={advisory.cta.href}>
              {advisory.cta.label}
              <span className="btn-chip" aria-hidden="true">
                <ArrowRight />
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { lookFor } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';

export function LookFor() {
  return (
    <section className="section" id="look-for" aria-labelledby="look-for-title">
      <div className="shell">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">{lookFor.eyebrow}</span>
            <h2 id="look-for-title" className="h2">
              {lookFor.heading}
            </h2>
            <p className="lede">{lookFor.lede}</p>
          </div>
        </Reveal>

        <div className="pillars">
          {lookFor.items.map((item, index) => (
            <Reveal key={item.title} className="reveal-fill" delay={index * 100}>
              <article className="pillar glass">
                <span className="pillar-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

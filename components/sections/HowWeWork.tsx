import { howWeWork } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';

export function HowWeWork() {
  return (
    <section className="section" id="how" aria-labelledby="how-title">
      <div className="shell">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">{howWeWork.eyebrow}</span>
            <h2 id="how-title" className="h2">
              {howWeWork.heading}
            </h2>
            <p className="lede">{howWeWork.lede}</p>
          </div>
        </Reveal>

        <div className="steps">
          {howWeWork.steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 110}>
              <article className="step glass">
                <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="step-copy">
                  <h3>{step.title}</h3>
                  {step.subtitle ? <p className="step-subtitle">{step.subtitle}</p> : null}
                  <p>{step.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

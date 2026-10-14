import { process } from '@/lib/site';

export function Process() {
  return (
    <section className="section wrap" aria-labelledby="process-title">
      <div className="eyebrow">{process.eyebrow}</div>
      <h2 id="process-title">{process.heading}</h2>
      <p className="lede">{process.lede}</p>
      <div className="steps">
        {process.steps.map((step) => (
          <div className="step" key={step.title}>
            <b>{step.title}</b>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

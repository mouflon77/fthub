import { about } from '@/lib/site';

export function About() {
  return (
    <section className="section wrap" id="about">
      <div className="dark">
        <div className="eyebrow about-eyebrow">{about.eyebrow}</div>
        <h2>
          Small team. Fast cycles.
          <br />
          Real products.
        </h2>
        <p className="lede">{about.lede}</p>
        <div className="principles">
          {about.principles.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

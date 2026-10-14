import { coming } from '@/lib/site';

export function Coming() {
  return (
    <section className="section section-tight wrap" aria-labelledby="coming-title">
      <div className="eyebrow">{coming.eyebrow}</div>
      <h2 id="coming-title">{coming.heading}</h2>
      <p className="lede coming-lede">{coming.lede}</p>
      <div className="future">
        {coming.items.map((item) => (
          <article className="future-card" key={item.name}>
            <div className="future-icon" aria-hidden="true">
              {item.icon}
            </div>
            <h3>{item.name}</h3>
            <p>
              <b>{item.lead}</b>
              <br />
              {item.body}
            </p>
            <div className="coming">Coming soon</div>
          </article>
        ))}
      </div>
    </section>
  );
}

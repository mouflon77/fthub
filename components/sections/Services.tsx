import { services } from '@/lib/site';

export function Services() {
  return (
    <section id="services" className="section wrap" aria-labelledby="services-title">
      <div className="eyebrow">{services.eyebrow}</div>
      <h2 id="services-title">{services.heading}</h2>
      <p className="lede services-lede">{services.lede}</p>
      <div className="three">
        {services.items.map((item) => (
          <div className="service-card" key={item.title}>
            <span className="number">{item.number}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

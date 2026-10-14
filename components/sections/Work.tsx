import { work } from '@/lib/site';
import { ProductCard } from './ProductCard';
import { HasturVisual, JobsVisual } from './ProductVisuals';
import { Pipeline } from './Pipeline';

const visuals = {
  jobs: <JobsVisual />,
  hastur: <HasturVisual />,
} as const;

export function Work() {
  return (
    <section id="products" className="section wrap">
      <div className="topline">
        <div>
          <div className="eyebrow">{work.eyebrow}</div>
          <h2>{work.heading}</h2>
          <p className="lede">{work.lede}</p>
        </div>
      </div>
      {work.products.map((product) => (
        <ProductCard
          key={product.key}
          status={product.status}
          name={product.name}
          claim={product.claim}
          body={product.body}
          href={product.href}
          cta={product.cta}
          socials={product.socials}
          visual={visuals[product.visual]}
        />
      ))}
      <Pipeline />
    </section>
  );
}

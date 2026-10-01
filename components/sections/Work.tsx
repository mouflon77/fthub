import Image from 'next/image';
import { work } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight, Spark } from '@/components/ui/Icons';
import { SocialLinks } from '@/components/ui/SocialLinks';
import { Pipeline } from './Pipeline';

export function Work() {
  const { product } = work;

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="shell">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">{work.eyebrow}</span>
            <h2 id="work-title" className="h2">
              {work.heading}
            </h2>
            <p className="lede">{work.lede}</p>
            <p className="work-question">
              Each product starts with the same question:
              <em> {work.question}</em>
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <article className="product glass">
            <div className="product-visual">
              <Image
                className="product-shot"
                src={product.image}
                alt={`${product.name} homepage`}
                fill
                sizes="(min-width: 960px) 48vw, 92vw"
                unoptimized
              />
              <span className="product-tag">{product.eyebrow}</span>
            </div>

            <div className="product-body">
              <div className="product-title">
                <h3>{product.name}</h3>
                <span className="product-host">{product.display}</span>
              </div>

              <p className="product-tagline">{product.tagline}</p>
              <p className="product-copy">{product.problem}</p>
              <p className="product-copy">{product.pitch}</p>

              <div className="product-features">
                <h4>{product.featuresHeading}</h4>
                <ul>
                  {product.features.map((feature) => (
                    <li key={feature}>
                      <Spark />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="product-foot">
                <SocialLinks links={product.socials} />
                <a className="btn btn-primary" href={product.href} target="_blank" rel="noreferrer noopener">
                  {product.cta}
                  <span className="btn-chip" aria-hidden="true">
                    <ArrowRight />
                  </span>
                </a>
              </div>
            </div>
          </article>
        </Reveal>

        <Pipeline />
      </div>
    </section>
  );
}

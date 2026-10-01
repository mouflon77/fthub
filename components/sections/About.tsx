import { about } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';

export function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="shell">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">{about.eyebrow}</span>
            <h2 id="about-title" className="h2">
              {about.heading}
            </h2>
          </div>
        </Reveal>

        <div className="about-grid">
          <Reveal className="reveal-fill" delay={80}>
            <div className="about-copy glass">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal className="reveal-fill" delay={160}>
            <div className="about-callout glass">
              <h3>{about.callout.heading}</h3>
              {about.callout.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

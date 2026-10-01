import { lab } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';

export function Lab() {
  return (
    <section className="section" id="lab" aria-labelledby="lab-title">
      <div className="shell">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">{lab.eyebrow}</span>
            <h2 id="lab-title" className="h2">
              {lab.heading}
            </h2>
            <p className="lede">{lab.lede}</p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="lab-intro glass">
            {lab.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 28)}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <p className="lab-interests-label">{lab.interestsHeading}</p>

        <div className="lab-grid">
          {lab.interests.map((interest, index) => (
            <Reveal key={interest.title} className="reveal-fill" delay={index * 90}>
              <article className="lab-card glass">
                <h3>{interest.title}</h3>
                <p>{interest.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

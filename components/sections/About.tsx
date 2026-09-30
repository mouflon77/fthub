import { about } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';

const NOTES = [
  {
    lead: 'How we work',
    body: 'Small team, direct contact, short loops. We would rather ship a narrow thing that works than a broad thing that demos.',
  },
  {
    lead: 'What we look for',
    body: 'Problems where the interface is the product, where the data is messy, and where being early actually matters.',
  },
  {
    lead: 'Where we start',
    body: 'A conversation, then a prototype you can click, usually inside a fortnight.',
  },
];

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
            <p className="lede">{about.lede}</p>
          </div>
        </Reveal>

        <div className="about-grid">
          <Reveal className="reveal-fill" delay={80}>
            <div className="about-copy glass">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <div className="about-notes">
            {NOTES.map((note, index) => (
              <Reveal key={note.lead} delay={160 + index * 90}>
                <div className="note glass">
                  <h3>{note.lead}</h3>
                  <p>{note.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="pillars">
          {about.pillars.map((pillar, index) => (
            <Reveal key={pillar.title} className="reveal-fill" delay={index * 110}>
              <article className="pillar glass">
                <span className="pillar-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

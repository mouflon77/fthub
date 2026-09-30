import { work } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';
import { ProjectCard } from '@/components/ui/ProjectCard';

export function Work() {
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
          </div>
        </Reveal>

        <div className="work-grid">
          {work.projects.map((project, index) => (
            <Reveal key={project.name} className="reveal-fill" delay={index * 120}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

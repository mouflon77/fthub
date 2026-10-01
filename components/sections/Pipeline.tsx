import { listProjects, type Project } from '@/lib/admin/store';
import { SocialLinks } from '@/components/ui/SocialLinks';
import type { SocialLink } from '@/lib/site';

function hostOf(href: string) {
  try {
    return new URL(href).host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function socialLinks(project: Project): SocialLink[] {
  const names = { linkedin: 'LinkedIn', x: 'X', telegram: 'Telegram' } as const;
  return project.socials.map((social) => ({
    kind: social.kind,
    href: social.href,
    label: `${project.name} on ${names[social.kind]}`,
  }));
}

function ProjectCard({ project }: { project: Project }) {
  const host = hostOf(project.href);
  const socials = socialLinks(project);

  return (
    <article className="product pipeline-product glass">
      <div className="product-visual">
        {project.image ? <img className="product-shot" src={project.image} alt={`${project.name} site`} /> : null}
        <span className="product-tag">{project.status === 'live' ? 'Live' : 'Building'}</span>
      </div>

      <div className="product-body">
        <div className="product-title">
          <h3>{project.name}</h3>
          {host ? <span className="product-host">{host}</span> : null}
        </div>
        {project.tagline ? <p className="product-tagline">{project.tagline}</p> : null}
        <p className="product-copy">{project.summary}</p>
        {project.href || socials.length ? (
          <div className="product-foot">
            <SocialLinks links={socials} />
            {project.href ? (
              <a className="btn btn-primary" href={project.href} target="_blank" rel="noreferrer noopener">
                Visit {project.name}
                <span className="btn-chip" aria-hidden="true">
                  →
                </span>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export async function Pipeline() {
  let projects: Project[] = [];
  try {
    projects = await listProjects();
  } catch {
    return null;
  }
  if (projects.length === 0) return null;

  return (
    <div className="pipeline">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

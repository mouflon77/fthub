import { listProjects, type Project } from '@/lib/admin/store';
import type { SocialLink } from '@/lib/site';
import { ProductCard } from './ProductCard';
import { ProjectVisual } from './ProductVisuals';

function socialLinks(project: Project): SocialLink[] {
  const names = { linkedin: 'LinkedIn', x: 'X', telegram: 'Telegram' } as const;
  return project.socials
    .filter((social) => social.href)
    .map((social) => ({
      kind: social.kind,
      href: social.href,
      label: `${project.name} on ${names[social.kind]}`,
    }));
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
    <>
      {projects.map((project) => (
        <ProductCard
          key={project.id}
          status={project.status === 'live' ? 'Live product' : 'In development'}
          name={project.name}
          claim={project.tagline}
          body={project.summary}
          href={project.href}
          cta={project.href ? `Explore ${project.name}` : undefined}
          socials={socialLinks(project)}
          visual={<ProjectVisual name={project.name} tagline={project.tagline} image={project.image} />}
        />
      ))}
    </>
  );
}

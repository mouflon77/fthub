import { listProjects } from '@/lib/admin/store';

export async function Pipeline() {
  let projects: Awaited<ReturnType<typeof listProjects>> = [];
  try {
    projects = await listProjects();
  } catch {
    return null;
  }
  if (projects.length === 0) return null;

  return (
    <div className="pipeline">
      <h3 className="pipeline-label">In progress</h3>
      <div className="pipeline-grid">
        {projects.map((project) => (
          <article key={project.id} className="pipeline-card glass">
            <span className="pillar-index">{project.status === 'live' ? 'Live' : 'Building'}</span>
            <h3>{project.name}</h3>
            <p>{project.summary}</p>
            {project.href ? (
              <a href={project.href} target="_blank" rel="noreferrer noopener">
                Visit
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

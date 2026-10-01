import { readSessionEmail } from '@/lib/admin/auth';
import { addProject, listProjects, removeProject, type ProjectStatus } from '@/lib/admin/store';

async function requireAdmin() {
  const email = await readSessionEmail();
  if (!email) return null;
  return email;
}

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: 'Sign in first.' }, { status: 401 });
  const projects = await listProjects();
  return Response.json({ projects });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Sign in first.' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    summary?: string;
    href?: string;
    status?: string;
  } | null;

  const name = body?.name?.trim() ?? '';
  const summary = body?.summary?.trim() ?? '';
  const href = body?.href?.trim() ?? '';
  const status: ProjectStatus = body?.status === 'live' ? 'live' : 'building';

  if (name.length < 2 || name.length > 80) {
    return Response.json({ error: 'Give the project a name.' }, { status: 400 });
  }
  if (summary.length < 2 || summary.length > 400) {
    return Response.json({ error: 'Add a short summary.' }, { status: 400 });
  }
  if (href && !/^https?:\/\//i.test(href)) {
    return Response.json({ error: 'The link should start with https://' }, { status: 400 });
  }

  try {
    const project = await addProject({ name, summary, href, status });
    return Response.json({ project });
  } catch {
    return Response.json({ error: 'Projects could not be saved. Storage is not configured.' }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Sign in first.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return Response.json({ error: 'Missing project.' }, { status: 400 });
  await removeProject(body.id);
  return Response.json({ ok: true });
}

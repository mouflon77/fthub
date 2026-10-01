import { readSessionEmail } from '@/lib/admin/auth';
import { addProject, listProjects, removeProject, updateProject, type ProjectInput, type ProjectSocial, type ProjectStatus } from '@/lib/admin/store';

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

function readProject(body: {
  name?: string;
  tagline?: string;
  summary?: string;
  href?: string;
  image?: string;
  status?: string;
  socials?: { kind?: string; href?: string }[];
} | null): { error: string } | { input: ProjectInput } {
  const name = body?.name?.trim() ?? '';
  const tagline = body?.tagline?.trim() ?? '';
  const summary = body?.summary?.trim() ?? '';
  const href = body?.href?.trim() ?? '';
  const image = body?.image?.trim() ?? '';
  const status: ProjectStatus = body?.status === 'live' ? 'live' : 'building';
  const socials: ProjectSocial[] = [];

  if (name.length < 2 || name.length > 80) return { error: 'Give the project a name.' };
  if (tagline.length > 140) return { error: 'Keep the tagline shorter.' };
  if (summary.length < 2 || summary.length > 600) return { error: 'Add a short summary.' };
  if (href && !/^https?:\/\//i.test(href)) return { error: 'The link should start with https://' };
  if (image && !/^https?:\/\//i.test(image) && !image.startsWith('data:image/')) {
    return { error: 'Use an image file or an image link.' };
  }
  if (image.length > 900_000) return { error: 'That image is too large. Use a smaller screenshot.' };

  for (const item of body?.socials ?? []) {
    const link = item?.href?.trim() ?? '';
    if (!link) continue;
    if (item.kind !== 'linkedin' && item.kind !== 'x' && item.kind !== 'telegram') {
      return { error: 'Choose LinkedIn, X, or Telegram.' };
    }
    if (!/^https?:\/\//i.test(link)) return { error: 'Social links should start with https://' };
    socials.push({ kind: item.kind, href: link });
  }

  return { input: { name, tagline, summary, href, image, status, socials } };
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Sign in first.' }, { status: 401 });
  const parsed = readProject((await request.json().catch(() => null)) as Parameters<typeof readProject>[0]);
  if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const project = await addProject(parsed.input);
    return Response.json({ project });
  } catch {
    return Response.json({ error: 'Projects could not be saved. Storage is not configured.' }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Sign in first.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    name?: string;
    tagline?: string;
    summary?: string;
    href?: string;
    image?: string;
    status?: string;
    socials?: { kind?: string; href?: string }[];
  } | null;
  if (!body?.id) return Response.json({ error: 'Missing project.' }, { status: 400 });
  const parsed = readProject(body);
  if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const project = await updateProject(body.id, parsed.input);
    if (!project) return Response.json({ error: 'That project is gone.' }, { status: 404 });
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

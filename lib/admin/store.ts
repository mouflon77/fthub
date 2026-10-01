import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { unstable_noStore as noStore } from 'next/cache';

export type ProjectStatus = 'building' | 'live';

export type Project = {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  href: string;
  image: string;
  status: ProjectStatus;
  createdAt: string;
};

export type ProjectInput = Omit<Project, 'id' | 'createdAt'>;

type OtpRecord = {
  hash: string;
  exp: number;
  attempts: number;
  sentAt: number;
};

type FileStore = {
  projects: Project[];
  otps: Record<string, OtpRecord>;
};

const FILE = path.join(process.cwd(), '.data', 'admin.json');

function redisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function redis(command: (string | number)[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Project storage is not configured');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (!response.ok || payload.error) throw new Error('Project storage failed');
  return payload.result;
}

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    const parsed = JSON.parse(raw) as FileStore;
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      otps: parsed.otps ?? {},
    };
  } catch {
    return { projects: [], otps: {} };
  }
}

async function writeFileStore(store: FileStore) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(store));
}

export async function listProjects() {
  noStore();
  if (!redisConfigured()) {
    if (process.env.VERCEL) return [];
    const store = await readFileStore();
    return store.projects.map(normalizeProject).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  const raw = await redis(['GET', 'projects']);
  if (typeof raw !== 'string' || !raw) return [];
  const projects = JSON.parse(raw) as Project[];
  return projects.map(normalizeProject).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    tagline: project.tagline ?? '',
    image: project.image ?? '',
    href: project.href ?? '',
  };
}

export async function addProject(input: ProjectInput) {
  const project: Project = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const projects = await listProjects();
  projects.unshift(project);
  await saveProjects(projects);
  return project;
}

export async function updateProject(id: string, input: ProjectInput) {
  const projects = await listProjects();
  const index = projects.findIndex((project) => project.id === id);
  if (index < 0) return null;
  const project: Project = { ...projects[index], ...input, id, createdAt: projects[index].createdAt };
  projects[index] = project;
  await saveProjects(projects);
  return project;
}

export async function removeProject(id: string) {
  const projects = (await listProjects()).filter((project) => project.id !== id);
  await saveProjects(projects);
}

async function saveProjects(projects: Project[]) {
  if (redisConfigured()) {
    await redis(['SET', 'projects', JSON.stringify(projects)]);
    return;
  }
  if (process.env.VERCEL) throw new Error('Project storage is not configured');
  const store = await readFileStore();
  store.projects = projects;
  await writeFileStore(store);
}

export async function saveLoginCode(email: string, hash: string) {
  const record: OtpRecord = {
    hash,
    exp: Date.now() + 10 * 60 * 1000,
    attempts: 0,
    sentAt: Date.now(),
  };

  if (redisConfigured()) {
    await redis(['SET', `otp:${email}`, JSON.stringify(record), 'EX', 600]);
    return;
  }
  if (process.env.VERCEL) throw new Error('Project storage is not configured');
  const store = await readFileStore();
  store.otps[email] = record;
  await writeFileStore(store);
}

export async function readLoginCode(email: string) {
  if (redisConfigured()) {
    const raw = await redis(['GET', `otp:${email}`]);
    if (typeof raw !== 'string' || !raw) return null;
    return JSON.parse(raw) as OtpRecord;
  }
  if (process.env.VERCEL) return null;
  const store = await readFileStore();
  return store.otps[email] ?? null;
}

export async function writeLoginCode(email: string, record: OtpRecord) {
  if (redisConfigured()) {
    const ttl = Math.max(1, Math.ceil((record.exp - Date.now()) / 1000));
    await redis(['SET', `otp:${email}`, JSON.stringify(record), 'EX', ttl]);
    return;
  }
  const store = await readFileStore();
  store.otps[email] = record;
  await writeFileStore(store);
}

export async function clearLoginCode(email: string) {
  if (redisConfigured()) {
    await redis(['DEL', `otp:${email}`]);
    return;
  }
  const store = await readFileStore();
  delete store.otps[email];
  await writeFileStore(store);
}

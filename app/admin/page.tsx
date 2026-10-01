'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Project } from '@/lib/admin/store';

type Step = 'email' | 'code' | 'ready';

async function readImageFile(file: File) {
  const source = await createImageBitmap(file);
  const max = 1400;
  const scale = Math.min(1, max / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not read that image.');
  context.drawImage(source, 0, 0, width, height);
  source.close();
  const data = canvas.toDataURL('image/jpeg', 0.72);
  if (data.length > 900_000) throw new Error('That image is too large. Use a smaller screenshot.');
  return data;
}

function hostOf(href: string) {
  try {
    return new URL(href).host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export default function AdminPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [summary, setSummary] = useState('');
  const [href, setHref] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'building' | 'live'>('building');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const response = await fetch('/api/admin/session');
      if (!response.ok) return;
      const data = (await response.json()) as { email: string };
      if (ignore) return;
      setEmail(data.email);
      setStep('ready');
      const list = await fetch('/api/admin/projects');
      if (!list.ok || ignore) return;
      const body = (await list.json()) as { projects: Project[] };
      setProjects(body.projects);
    })();
    return () => {
      ignore = true;
    };
  }, []);

  function resetForm() {
    setEditingId(null);
    setName('');
    setTagline('');
    setSummary('');
    setHref('');
    setImage('');
    setStatus('building');
  }

  function editProject(project: Project) {
    setEditingId(project.id);
    setName(project.name);
    setTagline(project.tagline);
    setSummary(project.summary);
    setHref(project.href);
    setImage(project.image);
    setStatus(project.status);
    setMessage('');
  }

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    const response = await fetch('/api/admin/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(data.error ?? 'The code could not be sent.');
      return;
    }
    setStep('code');
    setMessage('If that email is on the list, a code is on its way.');
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    const response = await fetch('/api/admin/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(data.error ?? 'That code is not valid.');
      return;
    }
    setStep('ready');
    const list = await fetch('/api/admin/projects');
    if (list.ok) {
      const body = (await list.json()) as { projects: Project[] };
      setProjects(body.projects);
    }
  }

  async function onImage(file: File | undefined) {
    if (!file) return;
    setMessage('');
    try {
      setImage(await readImageFile(file));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not read that image.');
    }
  }

  async function saveProject(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    const payload = { id: editingId, name, tagline, summary, href, image, status };
    const response = await fetch('/api/admin/projects', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string; project?: Project };
    setPending(false);
    if (!response.ok || !data.project) {
      setMessage(data.error ?? 'The project could not be saved.');
      return;
    }
    setProjects((current) =>
      editingId ? current.map((project) => (project.id === data.project!.id ? data.project! : project)) : [data.project!, ...current],
    );
    resetForm();
  }

  async function deleteProject(id: string) {
    const response = await fetch('/api/admin/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) return;
    setProjects((current) => current.filter((project) => project.id !== id));
    if (editingId === id) resetForm();
  }

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    setStep('email');
    setCode('');
    setProjects([]);
    resetForm();
  }

  return (
    <main className="admin">
      <div className="shell">
        <div className={`admin-card glass ${step === 'ready' ? 'admin-card-wide' : ''}`}>
          <p className="eyebrow">Studio</p>
          <h1>Projects</h1>

          {step === 'email' ? (
            <form className="admin-form" onSubmit={requestCode}>
              <label className="field">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={pending}>
                {pending ? 'Sending' : 'Send code'}
                <span className="btn-chip" aria-hidden="true">
                  →
                </span>
              </button>
            </form>
          ) : null}

          {step === 'code' ? (
            <form className="admin-form" onSubmit={verifyCode}>
              <label className="field">
                Code
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={pending}>
                {pending ? 'Checking' : 'Enter'}
                <span className="btn-chip" aria-hidden="true">
                  →
                </span>
              </button>
            </form>
          ) : null}

          {step === 'ready' ? (
            <>
              <div className="admin-bar">
                <p>{email}</p>
                <button className="admin-text" type="button" onClick={logout}>
                  Log out
                </button>
              </div>

              <form className="admin-form" onSubmit={saveProject}>
                <label className="field">
                  Name
                  <input required value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="field">
                  Tagline
                  <input value={tagline} onChange={(event) => setTagline(event.target.value)} />
                </label>
                <label className="field">
                  Summary
                  <textarea required rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} />
                </label>
                <label className="field">
                  Link
                  <input
                    type="url"
                    placeholder="https://"
                    value={href}
                    onChange={(event) => setHref(event.target.value)}
                  />
                </label>
                <label className="field">
                  Site image
                  <input type="file" accept="image/*" onChange={(event) => onImage(event.target.files?.[0])} />
                </label>
                {image ? (
                  <div className="admin-preview">
                    <img src={image} alt="" />
                    <button className="admin-text" type="button" onClick={() => setImage('')}>
                      Remove image
                    </button>
                  </div>
                ) : null}
                <label className="field">
                  Status
                  <select value={status} onChange={(event) => setStatus(event.target.value as 'building' | 'live')}>
                    <option value="building">Building</option>
                    <option value="live">Live</option>
                  </select>
                </label>
                <div className="admin-form-actions">
                  <button className="btn btn-primary" type="submit" disabled={pending}>
                    {pending ? 'Saving' : editingId ? 'Save changes' : 'Add project'}
                    <span className="btn-chip" aria-hidden="true">
                      →
                    </span>
                  </button>
                  {editingId ? (
                    <button className="admin-text" type="button" onClick={resetForm}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <ul className="admin-list">
                {projects.map((project) => (
                  <li key={project.id} className="admin-project">
                    {project.image ? <img className="admin-thumb" src={project.image} alt="" /> : <span className="admin-thumb" />}
                    <div className="admin-project-copy">
                      <strong>{project.name}</strong>
                      <span>{project.status === 'live' ? 'Live' : 'Building'}</span>
                      {project.href ? <span className="admin-host">{hostOf(project.href)}</span> : null}
                      <p>{project.summary}</p>
                    </div>
                    <div className="admin-project-actions">
                      <button className="admin-text" type="button" onClick={() => editProject(project)}>
                        Edit
                      </button>
                      <button className="admin-text admin-remove" type="button" onClick={() => deleteProject(project.id)}>
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {message ? <p className="admin-message">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Project } from '@/lib/admin/store';

type Step = 'email' | 'code' | 'ready';

export default function AdminPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [href, setHref] = useState('');
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

  async function createProject(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    const response = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, summary, href, status }),
    });
    const data = (await response.json()) as { error?: string; project?: Project };
    setPending(false);
    if (!response.ok || !data.project) {
      setMessage(data.error ?? 'The project could not be saved.');
      return;
    }
    setProjects((current) => [data.project!, ...current]);
    setName('');
    setSummary('');
    setHref('');
    setStatus('building');
  }

  async function deleteProject(id: string) {
    const response = await fetch('/api/admin/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (response.ok) setProjects((current) => current.filter((project) => project.id !== id));
  }

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    setStep('email');
    setCode('');
    setProjects([]);
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
                <button className="btn btn-link" type="button" onClick={logout}>
                  Log out
                </button>
              </div>

              <form className="admin-form" onSubmit={createProject}>
                <label className="field">
                  Name
                  <input required value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="field">
                  Summary
                  <textarea required rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} />
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
                  Status
                  <select value={status} onChange={(event) => setStatus(event.target.value as 'building' | 'live')}>
                    <option value="building">Building</option>
                    <option value="live">Live</option>
                  </select>
                </label>
                <button className="btn btn-primary" type="submit" disabled={pending}>
                  {pending ? 'Saving' : 'Add project'}
                  <span className="btn-chip" aria-hidden="true">
                    →
                  </span>
                </button>
              </form>

              <ul className="admin-list">
                {projects.map((project) => (
                  <li key={project.id}>
                    <div>
                      <strong>{project.name}</strong>
                      <span>{project.status === 'live' ? 'Live' : 'Building'}</span>
                      <p>{project.summary}</p>
                    </div>
                    <button className="btn btn-link" type="button" onClick={() => deleteProject(project.id)}>
                      Remove
                    </button>
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

import { createLoginCode, hashLoginCode, isAllowedEmail, normalizeEmail } from '@/lib/admin/auth';
import { sendLoginCode } from '@/lib/admin/mail';
import { readLoginCode, saveLoginCode } from '@/lib/admin/store';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = normalizeEmail(body?.email);
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Enter a valid email.' }, { status: 400 });
  }

  if (!isAllowedEmail(email)) {
    return Response.json({ ok: true });
  }

  const existing = await readLoginCode(email);
  if (existing && Date.now() - existing.sentAt < 30_000) {
    return Response.json({ error: 'Wait a moment before requesting another code.' }, { status: 429 });
  }

  const code = createLoginCode();
  try {
    await saveLoginCode(email, hashLoginCode(email, code));
    await sendLoginCode(email, code);
  } catch {
    return Response.json({ error: 'The code could not be sent. Check the email settings.' }, { status: 502 });
  }

  return Response.json({ ok: true });
}

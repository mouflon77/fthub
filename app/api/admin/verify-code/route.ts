import { codesMatch, hashLoginCode, isAllowedEmail, normalizeEmail, writeSession } from '@/lib/admin/auth';
import { clearLoginCode, readLoginCode, writeLoginCode } from '@/lib/admin/store';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; code?: string } | null;
  const email = normalizeEmail(body?.email);
  const code = typeof body?.code === 'string' ? body.code.trim() : '';

  if (!email || !isAllowedEmail(email) || !/^\d{6}$/.test(code)) {
    return Response.json({ error: 'That code is not valid.' }, { status: 401 });
  }

  const record = await readLoginCode(email);
  if (!record || record.exp < Date.now() || record.attempts >= 5) {
    return Response.json({ error: 'That code is not valid.' }, { status: 401 });
  }

  if (!codesMatch(record.hash, hashLoginCode(email, code))) {
    await writeLoginCode(email, { ...record, attempts: record.attempts + 1 });
    return Response.json({ error: 'That code is not valid.' }, { status: 401 });
  }

  await clearLoginCode(email);
  await writeSession(email);
  return Response.json({ ok: true, email });
}

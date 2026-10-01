import { clearSession, readSessionEmail } from '@/lib/admin/auth';

export async function GET() {
  const email = await readSessionEmail();
  if (!email) return Response.json({ email: null }, { status: 401 });
  return Response.json({ email });
}

export async function DELETE() {
  await clearSession();
  return Response.json({ ok: true });
}

import { createHash, createHmac, randomInt, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'fth_admin';
const SESSION_DAYS = 7;

export function normalizeEmail(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

export function isAllowedEmail(email: string) {
  const list = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email);
}

export function createLoginCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashLoginCode(email: string, code: string) {
  return createHash('sha256').update(`${authSecret()}:${email}:${code}`).digest('hex');
}

export function codesMatch(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function readSessionEmail() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const email = verifySession(token);
  if (!email || !isAllowedEmail(email)) return null;
  return email;
}

export async function writeSession(email: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.VERCEL) throw new Error('AUTH_SECRET is not set');
  return 'dev-only-secret';
}

function signSession(email: string) {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 }),
  ).toString('base64url');
  const mac = createHmac('sha256', authSecret()).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}

function verifySession(token: string) {
  const [payload, mac] = token.split('.');
  if (!payload || !mac) return null;
  const expected = createHmac('sha256', authSecret()).update(payload).digest('base64url');
  if (!codesMatch(mac, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { email?: string; exp?: number };
    if (!parsed.email || !parsed.exp || parsed.exp < Date.now()) return null;
    return normalizeEmail(parsed.email);
  } catch {
    return null;
  }
}

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const DEFAULT_ADMIN_EMAILS = ['benji.pitts@gmail.com'];

export function getAdminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS;
  if (!fromEnv) return DEFAULT_ADMIN_EMAILS;

  return fromEnv
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.INTERNAL_API_KEY ||
    'dev-admin-session-secret-change-me'
  );
}

interface SessionPayload {
  email: string;
  exp: number;
}

function signSession(payload: SessionPayload): string {
  const payloadStr = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadStr)
    .digest('hex');

  return Buffer.from(JSON.stringify({ payload: payloadStr, signature })).toString('base64url');
}

function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as {
      payload: string;
      signature: string;
    };

    const expectedSignature = crypto
      .createHmac('sha256', getSessionSecret())
      .update(decoded.payload)
      .digest('hex');

    const sigBuffer = Buffer.from(decoded.signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(decoded.payload) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    if (!isAdminEmail(payload.email)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function createAdminSession(email: string): string {
  return signSession({
    email: email.toLowerCase(),
    exp: Date.now() + SESSION_DURATION_MS,
  });
}

export function getAdminSessionFromRequest(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function setAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function verifyFirebaseIdToken(idToken: string): Promise<string | null> {
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    // Fallback: Firebase Identity Toolkit REST API (works with API key only)
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { users?: Array<{ email?: string }> };
    return data.users?.[0]?.email?.toLowerCase() ?? null;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.email?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export function requireAdminSession(request: NextRequest): SessionPayload | NextResponse {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

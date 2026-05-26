import { NextRequest, NextResponse } from 'next/server';
import {
  verifyFirebaseIdToken,
  isAdminEmail,
  createAdminSession,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  getAdminSessionFromRequest,
} from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken = body.idToken as string | undefined;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const email = await verifyFirebaseIdToken(idToken);
    if (!email || !isAdminEmail(email)) {
      return NextResponse.json(
        { error: 'Access denied. This account is not authorized for admin.' },
        { status: 403 }
      );
    }

    const sessionToken = createAdminSession(email);
    const response = NextResponse.json({ authenticated: true, email });
    setAdminSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error('Admin session error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  clearAdminSessionCookie(response);
  return response;
}

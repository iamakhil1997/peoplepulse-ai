// PeoplePulse AI — Server-Side Demo Authentication Endpoint
// Authenticates requested demo persona using server-side DEMO_MODE_SECRET
// Sets HttpOnly, Secure, SameSite=Lax signed session cookie

import { NextResponse } from 'next/server';
import {
  createDemoSessionToken,
  DEMO_COOKIE_NAME,
  DEMO_PERSONAS,
  DEMO_SESSION_DURATION_SEC,
  DemoRole,
  isDemoModeEnabled,
} from '@/lib/auth/demo-session';

// Simple in-memory rate limiter per IP to prevent automated abuse
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 60_000 }); // 1-minute window
    return true;
  }
  if (entry.count >= 10) {
    return false; // Limit exceeded: max 10 requests per minute
  }
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    // 1. Guard: Check if Demo Mode is enabled on the server
    if (!isDemoModeEnabled()) {
      return NextResponse.json(
        { success: false, error: 'Demo mode is currently disabled on this deployment.' },
        { status: 403 }
      );
    }

    // 2. IP Rate Limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many demo requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    // 3. Parse and validate body
    const body = await request.json();
    const { role } = body as { role?: DemoRole };

    if (!role || !DEMO_PERSONAS[role]) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing demo role. Allowed: HR_Admin, Employee, Reviewer.' },
        { status: 400 }
      );
    }

    // 4. Generate signed demo session token
    const token = await createDemoSessionToken(role);
    const persona = DEMO_PERSONAS[role];

    // Determine default destination
    const destination = role === 'Employee' ? '/employee' : '/hr/dashboard';

    // 5. Construct response with HttpOnly, Secure cookie
    const response = NextResponse.json({
      success: true,
      data: {
        role: persona.role,
        name: persona.name,
        email: persona.email,
        destination,
      },
    });

    response.cookies.set({
      name: DEMO_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: DEMO_SESSION_DURATION_SEC,
    });

    return response;
  } catch (error: any) {
    console.error('[Demo Auth Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Demo authentication failed.' },
      { status: 500 }
    );
  }
}

// PeoplePulse AI — Logout Route
// Signs the user out of Supabase (clears auth cookies) AND clears Demo Mode session cookies.
// Must be a server-side route — never a client-side fetch with no redirect.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_COOKIE_NAME } from '@/lib/auth/demo-session';

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const cookieStore = await cookies();

  // 1. Sign out of Supabase if active
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore errors during demo / offline mode
  }

  // 2. Clear Demo Mode cookie if set
  const response = NextResponse.redirect(`${origin}/auth/login`);
  response.cookies.delete(DEMO_COOKIE_NAME);

  return response;
}

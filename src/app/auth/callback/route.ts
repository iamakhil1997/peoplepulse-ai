// PeoplePulse AI — Auth Callback Handler
// Supabase redirects to this route after the user clicks their magic link email.
// This route exchanges the one-time code for a real user session (sets auth cookies),
// then redirects the user to the appropriate protected area based on their role.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo');

  // If no code, something went wrong — send user back to login
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const cookieStore = cookies();

  // Collect cookies that Supabase wants to set
  const pendingCookies: { name: string; value: string; options: any }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // Supabase will call this with auth cookies to set
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          pendingCookies.push(...cookiesToSet);
        },
      },
    }
  );

  // Exchange the PKCE code for a real session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[Auth Callback] Code exchange failed:', error?.message);
    return NextResponse.redirect(`${origin}/auth/login?error=session_exchange_failed`);
  }

  // Look up the user's role in our custom users table to determine where to send them
  const { data: dbUser } = await supabase
    .from('users')
    .select('role_name, is_active')
    .eq('id', data.user.id)
    .single();

  if (!dbUser || !dbUser.is_active) {
    // User authenticated with Supabase but not provisioned in our system
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/auth/login?error=account_not_found`
    );
  }

  // Determine default landing page by role
  const roleName: string = dbUser.role_name ?? 'Employee';
  const isHR = ['HR', 'HR_Admin', 'Org_Admin', 'Super_Admin'].includes(roleName);

  // Honor an explicit redirectTo param if it's safe (same origin, within our app)
  let destination: string;
  if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('/auth')) {
    // Validate that the destination is appropriate for their role
    if (redirectTo.startsWith('/hr') && !isHR) {
      destination = '/employee';
    } else {
      destination = redirectTo;
    }
  } else {
    // Default landing by role
    destination = isHR ? '/hr/dashboard' : '/employee';
  }

  // Create redirect response and attach all Supabase auth cookies
  const response = NextResponse.redirect(`${origin}${destination}`);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

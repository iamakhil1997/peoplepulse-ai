// PeoplePulse AI — Route Protection Middleware
// Runs on every request BEFORE it reaches a page or API route.
// Enforces:
//   - Unauthenticated users → redirected to /auth/login
//   - Employees cannot access /hr/* routes
//   - Non-admin users cannot access /admin/* routes
//
// NOTE: This is the ONLY authoritative gatekeeper for route-level access.
// Do NOT rely on client-side navigation to enforce access control.

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication (any authenticated role is allowed)
const PROTECTED_PATHS = ['/employee', '/hr', '/admin'];

// Routes that additionally require an HR-level role
const HR_ONLY_PATHS = ['/hr'];

// Routes that additionally require an admin-level role
const ADMIN_ONLY_PATHS = ['/admin'];

// Roles that are considered "HR-level" (can access /hr/* routes)
const HR_ROLES = new Set(['HR', 'HR_Admin', 'Org_Admin', 'Super_Admin']);

// Roles that are considered "admin-level" (can access /admin/* routes)
const ADMIN_ROLES = new Set(['HR_Admin', 'Org_Admin', 'Super_Admin']);

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isHROnly(pathname: string): boolean {
  return HR_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAdminOnly(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run auth logic on protected paths
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  // Create a mutable response so we can update auth cookies
  let response = NextResponse.next({
    request,
  });

  // Build a Supabase client that reads from request cookies and writes to response cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this is critical: it re-validates JWTs and sets fresh cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- 1. Not authenticated → redirect to login ---
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- 2. Authenticated: check role for restricted sections ---
  // We read role_name from our custom users table via a minimal query.
  // We use the anon client here (RLS-enforced) — the user can only read their own row.
  const { data: dbUser } = await supabase
    .from('users')
    .select('role_name, organization_id, is_active')
    .eq('id', user.id)
    .single();

  // Account not provisioned in our DB yet, or deactivated — treat as unauthenticated
  if (!dbUser || !dbUser.is_active) {
    await supabase.auth.signOut();
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'account_not_found');
    return NextResponse.redirect(loginUrl);
  }

  const roleName: string = dbUser.role_name ?? 'Employee';

  // --- 3. HR routes: require HR-level role ---
  if (isHROnly(pathname) && !HR_ROLES.has(roleName)) {
    // Employee tried to access HR dashboard — send them to their own space
    return NextResponse.redirect(new URL('/employee', request.url));
  }

  // --- 4. Admin routes: require admin-level role ---
  if (isAdminOnly(pathname) && !ADMIN_ROLES.has(roleName)) {
    // Insufficient role for admin section
    return NextResponse.redirect(new URL('/employee', request.url));
  }

  // All checks passed — continue to the requested page
  return response;
}

export const config = {
  // Run the middleware on all routes EXCEPT:
  // - Static files (_next/static, images, favicon, etc.)
  // - API routes (they handle their own auth)
  // - auth routes (login, callback — must be publicly accessible)
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

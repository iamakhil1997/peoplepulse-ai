// PeoplePulse AI — HR Space Layout (Server Component)
// This layout is rendered for ALL pages under /hr/*.
// It performs a second server-side role check (defense-in-depth beyond middleware),
// fetches the session, and passes the user identity down via a shared context.

import { redirect } from 'next/navigation';
import { getSession, isHRRole } from '@/lib/auth/get-session';

export default async function HRSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Defense-in-depth: middleware already blocked this, but we verify again server-side
  if (!session) {
    redirect('/auth/login?redirectTo=/hr/dashboard');
  }

  if (!isHRRole(session.roleName)) {
    // Authenticated employee tried to reach HR space — send them home
    redirect('/employee');
  }

  // Children (HR pages) can call getSession() independently as needed.
  // We do NOT pass session as a prop here because Next.js Server Component
  // children cannot receive non-serializable data via layout props.
  // Each HR page should call getSession() directly for its own data needs.
  return <>{children}</>;
}

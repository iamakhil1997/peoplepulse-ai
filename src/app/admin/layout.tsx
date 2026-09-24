// PeoplePulse AI — Admin Space Layout (Server Component)
// This layout wraps ALL pages under /admin/*.
// Requires HR_Admin, Org_Admin, or Super_Admin role.

import { redirect } from 'next/navigation';
import { getSession, isAdminRole } from '@/lib/auth/get-session';

export default async function AdminSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login?redirectTo=/admin/onboarding');
  }

  if (!isAdminRole(session.roleName)) {
    // HR Specialists without admin role are redirected to HR dashboard
    redirect('/hr/dashboard');
  }

  return <>{children}</>;
}

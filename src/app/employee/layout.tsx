// PeoplePulse AI — Employee Space Layout (Server Component)
// This layout wraps ALL pages under /employee/*.
// It verifies authentication server-side (defense-in-depth beyond middleware).

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/get-session';

export default async function EmployeeSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Must be authenticated to view the employee space
  if (!session) {
    redirect('/auth/login?redirectTo=/employee');
  }

  // All roles can access the employee space (HR users are also employees of the org)
  // but HR-specific features won't be shown to regular employees.
  return <>{children}</>;
}

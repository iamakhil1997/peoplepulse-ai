// Server-side helper: get the current authenticated user + their org + role
// Returns null if not authenticated
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface SessionUser {
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
  roleName: string;
  firstName: string;
  lastName: string;
  departmentId: string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Look up the user in our users table by email
    const admin = createAdminClient();
    const { data: dbUser } = await admin
      .from('users')
      .select('id, organization_id, email, role_name, is_active')
      .eq('email', user.email!)
      .single();

    if (!dbUser || !dbUser.is_active) return null;

    // Get org name
    const { data: org } = await admin
      .from('organizations')
      .select('id, name')
      .eq('id', dbUser.organization_id)
      .single();

    // Get employee profile
    const { data: profile } = await admin
      .from('employee_profiles')
      .select('first_name, last_name, department_id')
      .eq('user_id', dbUser.id)
      .single();

    return {
      id: dbUser.id,
      email: dbUser.email,
      organizationId: dbUser.organization_id,
      organizationName: org?.name ?? 'Unknown Organization',
      roleName: dbUser.role_name,
      firstName: profile?.first_name ?? user.email!.split('@')[0],
      lastName: profile?.last_name ?? '',
      departmentId: profile?.department_id ?? null,
    };
  } catch {
    return null;
  }
}

export function isHRRole(roleName: string): boolean {
  return ['HR', 'HR_Admin', 'Org_Admin', 'Super_Admin'].includes(roleName);
}

export function isAdminRole(roleName: string): boolean {
  return ['HR_Admin', 'Org_Admin', 'Super_Admin'].includes(roleName);
}

// Server-side helper: get the current authenticated user + their org + role
// Supports both standard Supabase authentication and signed synthetic Demo Mode sessions.
// Returns null if not authenticated

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  DEMO_COOKIE_NAME,
  DEMO_PERSONAS,
  isDemoModeEnabled,
  verifyDemoSessionToken,
} from './demo-session';

export interface SessionUser {
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
  roleName: string;
  firstName: string;
  lastName: string;
  departmentId: string | null;
  isDemo?: boolean;
}

export async function getSession(): Promise<SessionUser | null> {
  // 1. Check for active Demo Mode session first (if demo mode is enabled on server)
  if (isDemoModeEnabled()) {
    try {
      const cookieStore = await cookies();
      const demoCookie = cookieStore.get(DEMO_COOKIE_NAME);
      if (demoCookie?.value) {
        const demoPayload = await verifyDemoSessionToken(demoCookie.value);
        if (demoPayload && DEMO_PERSONAS[demoPayload.role]) {
          const persona = DEMO_PERSONAS[demoPayload.role];
          return {
            id: persona.id,
            email: persona.email,
            organizationId: persona.organizationId,
            organizationName: persona.organizationName,
            roleName: persona.roleName,
            firstName: persona.name.split(' ')[0],
            lastName: persona.name.split(' ').slice(1).join(' '),
            departmentId: persona.departmentId,
            isDemo: true,
          };
        }
      }
    } catch {
      // In case of error reading cookies, fall through to Supabase
    }
  }

  // 2. Standard Production Supabase Session Check
  try {
    const supabase = await createClient();
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
      isDemo: false,
    };
  } catch {
    return null;
  }
}

export function isHRRole(roleName: string): boolean {
  return ['HR', 'HR_Admin', 'Org_Admin', 'Super_Admin', 'Reviewer'].includes(roleName);
}

export function isAdminRole(roleName: string): boolean {
  return ['HR_Admin', 'Org_Admin', 'Super_Admin'].includes(roleName);
}

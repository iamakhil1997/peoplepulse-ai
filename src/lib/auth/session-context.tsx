'use client';

// PeoplePulse AI — Session Context
// Supports both standard Supabase authentication and signed synthetic Demo Mode sessions.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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

interface SessionContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isHR: boolean;
  isAdmin: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  isLoading: true,
  isHR: false,
  isAdmin: false,
});

export function useSession() {
  return useContext(SessionContext);
}

const HR_ROLES = new Set(['HR', 'HR_Admin', 'Org_Admin', 'Super_Admin', 'Reviewer']);
const ADMIN_ROLES = new Set(['HR_Admin', 'Org_Admin', 'Super_Admin']);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // 1. Check for Demo Mode session via API endpoint
        const demoStatusRes = await fetch('/api/demo/session').catch(() => null);
        if (demoStatusRes && demoStatusRes.ok) {
          const demoJson = await demoStatusRes.json();
          if (demoJson.success && demoJson.data) {
            setUser({
              id: demoJson.data.id,
              email: demoJson.data.email,
              organizationId: demoJson.data.organizationId,
              organizationName: demoJson.data.organizationName,
              roleName: demoJson.data.roleName,
              firstName: demoJson.data.firstName,
              lastName: demoJson.data.lastName,
              departmentId: demoJson.data.departmentId,
              isDemo: true,
            });
            setIsLoading(false);
            return;
          }
        }

        // 2. Fall back to standard Supabase Client Session
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Fetch user details from custom users table
        const { data: dbUser } = await supabase
          .from('users')
          .select('id, organization_id, email, role_name')
          .eq('id', authUser.id)
          .single();

        if (!dbUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Fetch org name
        const { data: org } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('id', dbUser.organization_id)
          .single();

        // Fetch profile
        const { data: profile } = await supabase
          .from('employee_profiles')
          .select('first_name, last_name, department_id')
          .eq('user_id', dbUser.id)
          .single();

        setUser({
          id: dbUser.id,
          email: dbUser.email,
          organizationId: dbUser.organization_id,
          organizationName: org?.name ?? 'Your Organization',
          roleName: dbUser.role_name,
          firstName: profile?.first_name ?? authUser.email?.split('@')[0] ?? 'User',
          lastName: profile?.last_name ?? '',
          departmentId: profile?.department_id ?? null,
          isDemo: false,
        });
      } catch (err) {
        console.error('[SessionProvider] Failed to load session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Listen for auth state changes (login/logout)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // If not in demo mode, clear session
        fetchSession();
      } else {
        fetchSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isHR = user ? HR_ROLES.has(user.roleName) : false;
  const isAdmin = user ? ADMIN_ROLES.has(user.roleName) : false;

  return (
    <SessionContext.Provider value={{ user, isLoading, isHR, isAdmin }}>
      {children}
    </SessionContext.Provider>
  );
}

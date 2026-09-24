'use client';

// PeoplePulse AI — Session Context
// A lightweight client-side context that holds the current user's session data.
// This is populated by the SessionProvider and can be read by any client component
// (e.g. Navbar, user avatars) without making additional API calls.

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

const HR_ROLES = new Set(['HR', 'HR_Admin', 'Org_Admin', 'Super_Admin']);
const ADMIN_ROLES = new Set(['HR_Admin', 'Org_Admin', 'Super_Admin']);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchSession = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Fetch user details from our custom tables
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        // Re-fetch full user profile when auth state changes
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

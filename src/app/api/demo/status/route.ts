// PeoplePulse AI — Server-Side Demo Mode Status Endpoint
// Returns whether demo mode is currently enabled without exposing secrets

import { NextResponse } from 'next/server';
import { isDemoModeEnabled } from '@/lib/auth/demo-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const enabled = isDemoModeEnabled();
  return NextResponse.json({
    enabled,
    availableRoles: enabled
      ? [
          { role: 'HR_Admin', label: 'HR Administrator', description: 'Full access to Executive Dashboard, Roster, and All Grievances' },
          { role: 'Employee', label: 'Employee', description: 'Access to Employee Pulse check-in and Speak-Up space' },
          { role: 'Reviewer', label: 'Grievance Reviewer', description: 'Scoped access to review and resolve assigned cases only' },
        ]
      : [],
  });
}

// PeoplePulse AI — Current Demo Session Endpoint
// Returns session user info for the client SessionContext if active and valid

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();

  if (!session || !session.isDemo) {
    return NextResponse.json({ success: false, data: null });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: session.id,
      email: session.email,
      organizationId: session.organizationId,
      organizationName: session.organizationName,
      roleName: session.roleName,
      firstName: session.firstName,
      lastName: session.lastName,
      departmentId: session.departmentId,
      isDemo: true,
    },
  });
}

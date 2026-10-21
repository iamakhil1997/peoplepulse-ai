// PEOPLEPULSE AI — Grievance Submission & HR Inbox API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';
import { getSession } from '@/lib/auth/get-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const orgId = session?.organizationId || searchParams.get('orgId') || '00000000-0000-0000-0000-000000000001';
    const isDemo = Boolean(session?.isDemo);

    if (session?.roleName === 'Employee') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Employees cannot access the HR Grievance inbox.' },
        { status: 403 }
      );
    }

    const grievances = await GrievanceService.getHRGrievanceInbox(
      orgId,
      session?.roleName,
      session?.id,
      isDemo
    );

    return NextResponse.json({ success: true, data: grievances });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const {
      title,
      description,
      categorySelected,
      incidentDate,
      severityEmployee = 'Medium',
      isAnonymous = false,
      allowHrFollowup = true,
      preferredResponseMethod = 'Platform Case Inbox',
      departmentId,
    } = body;

    if (!title || !description || !categorySelected) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and category are required.' },
        { status: 400 }
      );
    }

    const organizationId = session?.organizationId || '00000000-0000-0000-0000-000000000001';
    const submitterId = isAnonymous ? null : session ? session.id : null;
    const resolvedDeptId = departmentId || session?.departmentId || null;
    const isDemo = Boolean(session?.isDemo);

    const result = await GrievanceService.submitGrievance({
      organizationId,
      submitterId,
      departmentId: resolvedDeptId,
      title,
      description,
      categorySelected,
      incidentDate,
      severityEmployee,
      isAnonymous: Boolean(isAnonymous),
      allowHrFollowup: Boolean(allowHrFollowup),
      preferredResponseMethod,
      isDemo,
    });

    return NextResponse.json({
      success: true,
      data: {
        grievance: result.grievance,
        caseNumber: result.caseNumber,
        rawAccessToken: result.rawAccessToken,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

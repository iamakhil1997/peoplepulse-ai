// PEOPLEPULSE AI — Grievance Submission & HR Inbox API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';
import { requireDemoApiSession } from '@/lib/auth/demo-api-access';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const access = await requireDemoApiSession({ hrOnly: true });
    if (access.response) return access.response;
    const session = access.session!;
    const orgId = session.organizationId;
    const isDemo = true;

    if (session?.roleName === 'Employee') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Employees cannot access the HR Grievance inbox.' },
        { status: 403 }
      );
    }

    const grievances = await GrievanceService.getHRGrievanceInbox(
      orgId,
      session.roleName,
      session.id,
      isDemo
    );

    return NextResponse.json({ success: true, data: grievances });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireDemoApiSession({ writeDisabled: true });
    if (access.response) return access.response;
    const session = access.session!;
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
    } = body;

    if (
      typeof title !== 'string' || title.trim().length < 1 || title.length > 200 ||
      typeof description !== 'string' || description.trim().length < 1 || description.length > 10000 ||
      typeof categorySelected !== 'string' || categorySelected.trim().length < 1 || categorySelected.length > 100
    ) {
      return NextResponse.json(
        { success: false, error: 'Add a title, description, and category within the allowed length limits.' },
        { status: 400 }
      );
    }

    const organizationId = session.organizationId;
    const submitterId = isAnonymous ? null : session.id;
    const resolvedDeptId = session.departmentId;
    const isDemo = true;

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

// PEOPLEPULSE AI — Grievance Submission & HR Inbox API
// Supports both standard Supabase and isolated synthetic Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';
import { getSession } from '@/lib/auth/get-session';
import { demoDataStore } from '@/lib/store/demo-store';
import { DemoRole } from '@/lib/auth/demo-session';

export async function GET(request: Request) {
  try {
    const session = await getSession();

    // Isolated synthetic Demo Mode handler
    if (session?.isDemo) {
      if (session.roleName === 'Employee') {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Employees cannot access the HR Grievance inbox.' },
          { status: 403 }
        );
      }

      const grievances = demoDataStore.getGrievances(
        session.roleName as DemoRole,
        session.id
      );
      return NextResponse.json({ success: true, data: grievances });
    }

    // Standard handler
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || '00000000-0000-0000-0000-000000000001';
    const grievances = await GrievanceService.getHRGrievanceInbox(orgId);
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
      organizationId = '00000000-0000-0000-0000-000000000001',
      submitterId,
      departmentId,
      title,
      description,
      categorySelected,
      incidentDate,
      severityEmployee = 'Medium',
      isAnonymous = false,
      allowHrFollowup = true,
      preferredResponseMethod = 'Platform Case Inbox',
    } = body;

    if (!title || !description || !categorySelected) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and category are required.' },
        { status: 400 }
      );
    }

    // In demo mode, route submission to demo store
    if (session?.isDemo) {
      const demoResult = await GrievanceService.submitGrievance({
        organizationId: session.organizationId,
        submitterId: isAnonymous ? null : session.id,
        departmentId: departmentId || session.departmentId,
        title,
        description,
        categorySelected,
        incidentDate,
        severityEmployee,
        isAnonymous: Boolean(isAnonymous),
        allowHrFollowup: Boolean(allowHrFollowup),
        preferredResponseMethod,
      });

      return NextResponse.json({
        success: true,
        data: {
          grievance: demoResult.grievance,
          caseNumber: demoResult.caseNumber,
          rawAccessToken: demoResult.rawAccessToken,
          aiAnalysis: demoResult.aiAnalysis,
        },
      });
    }

    const result = await GrievanceService.submitGrievance({
      organizationId,
      submitterId,
      departmentId,
      title,
      description,
      categorySelected,
      incidentDate,
      severityEmployee,
      isAnonymous: Boolean(isAnonymous),
      allowHrFollowup: Boolean(allowHrFollowup),
      preferredResponseMethod,
    });

    return NextResponse.json({
      success: true,
      data: {
        grievance: result.grievance,
        caseNumber: result.caseNumber,
        rawAccessToken: result.rawAccessToken, // Will be provided ONLY if anonymous for user to save
        aiAnalysis: result.aiAnalysis,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

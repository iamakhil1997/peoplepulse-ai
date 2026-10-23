// PEOPLEPULSE AI — Pulse Check-in & History API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
import { PulseService } from '@/lib/services/pulse-service';
import { requireDemoApiSession } from '@/lib/auth/demo-api-access';

export async function GET(request: Request) {
  try {
    const access = await requireDemoApiSession();
    if (access.response) return access.response;
    const session = access.session!;
    const { searchParams } = new URL(request.url);
    const orgId = session.organizationId;
    const isDemo = true;
    const view = searchParams.get('view');

    // 1. Employee history view
    if (view === 'history' && session) {
      const history = await PulseService.getEmployeePulseHistory(session.id, isDemo);
      return NextResponse.json({ success: true, data: history });
    }

    if (!['HR', 'HR_Admin', 'Org_Admin', 'Super_Admin', 'Reviewer'].includes(session.roleName)) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    // 2. Department mood averages for HR/Analytics
    const deptAverages = await PulseService.getDepartmentMoodAverages(orgId, 30, isDemo);
    return NextResponse.json({ success: true, data: deptAverages });
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
      moodScore,
      moodLabel,
      category,
      comment,
      isAnonymous = true,
      allowHrFollowup = true,
    } = body;

    if (!moodScore || !moodLabel) {
      return NextResponse.json(
        { success: false, error: 'Mood score and label are required.' },
        { status: 400 }
      );
    }

    // Server-enforced identity: never trust client-provided submitterId
    const organizationId = session.organizationId;
    const submitterId = session.id;
    const resolvedDeptId = session.departmentId;
    const isDemo = true;

    const pulse = await PulseService.submitPulse({
      organizationId,
      submitterId,
      departmentId: resolvedDeptId,
      moodScore,
      moodLabel,
      category: category || 'General',
      comment: comment?.trim() || null,
      isAnonymous: Boolean(isAnonymous),
      allowHrFollowup: Boolean(allowHrFollowup),
      isDemo,
    });

    return NextResponse.json({ success: true, data: pulse });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

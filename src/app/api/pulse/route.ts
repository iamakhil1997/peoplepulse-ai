// PEOPLEPULSE AI — Pulse Check-in API
// Supports both standard Supabase and isolated synthetic Demo Mode

import { NextResponse } from 'next/server';
import { PulseService } from '@/lib/services/pulse-service';
import { getSession } from '@/lib/auth/get-session';
import { demoDataStore } from '@/lib/store/demo-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || '00000000-0000-0000-0000-000000000001';
    const deptAverages = await PulseService.getDepartmentMoodAverages(orgId);
    return NextResponse.json({ success: true, data: deptAverages });
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
      moodScore,
      moodLabel,
      category,
      comment,
      isAnonymous,
      allowHrFollowup,
    } = body;

    if (!moodScore || !moodLabel) {
      return NextResponse.json(
        { success: false, error: 'Mood score and label are required.' },
        { status: 400 }
      );
    }

    // Demo Mode submission
    if (session?.isDemo) {
      const demoPulse = demoDataStore.addPulse({
        organization_id: session.organizationId,
        submitter_id: isAnonymous ? null : session.id,
        department_id: departmentId || session.departmentId || '00000000-0000-0000-0001-000000000002',
        mood_score: moodScore,
        mood_label: moodLabel,
        category: category || 'General',
        comment: comment || null,
        is_anonymous: Boolean(isAnonymous),
        allow_hr_followup: Boolean(allowHrFollowup),
      });

      return NextResponse.json({ success: true, data: demoPulse });
    }

    const pulse = await PulseService.submitPulse({
      organizationId,
      submitterId,
      departmentId,
      moodScore,
      moodLabel,
      category,
      comment,
      isAnonymous: Boolean(isAnonymous),
      allowHrFollowup: Boolean(allowHrFollowup),
    });

    return NextResponse.json({ success: true, data: pulse });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

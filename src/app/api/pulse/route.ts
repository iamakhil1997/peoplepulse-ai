// PEOPLEPULSE AI — Pulse Check-in API

import { NextResponse } from 'next/server';
import { PulseService } from '@/lib/services/pulse-service';

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

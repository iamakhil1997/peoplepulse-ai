// PEOPLEPULSE AI — Grievance Message & Internal HR Notes API

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      organizationId = '00000000-0000-0000-0000-000000000001',
      hrUserId = '00000000-0000-0000-0003-000000000001',
      messageText,
      isInternalNote = false,
    } = body;

    if (!messageText || !messageText.trim()) {
      return NextResponse.json({ success: false, error: 'Message text cannot be empty' }, { status: 400 });
    }

    const message = await GrievanceService.addHRMessage({
      organizationId,
      grievanceId: params.id,
      hrUserId,
      messageText,
      isInternalNote: Boolean(isInternalNote),
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

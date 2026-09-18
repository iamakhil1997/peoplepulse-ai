// PEOPLEPULSE AI — Anonymous Submitter Reply API

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseNumber, passcode, messageText } = body;

    if (!caseNumber || !passcode || !messageText) {
      return NextResponse.json(
        { success: false, error: 'Case Number, Passcode, and Message are required.' },
        { status: 400 }
      );
    }

    const result = await GrievanceService.sendAnonymousReply(caseNumber.trim(), passcode.trim(), messageText.trim());

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: result.message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

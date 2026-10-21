// PEOPLEPULSE AI — Anonymous Submitter Reply API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';

export const dynamic = 'force-dynamic';

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

    // Try demo store first, then fallback
    let lookup = await GrievanceService.trackAnonymousGrievance(caseNumber.trim(), passcode.trim(), true);
    let isDemo = true;
    if (!lookup.success) {
      lookup = await GrievanceService.trackAnonymousGrievance(caseNumber.trim(), passcode.trim(), false);
      isDemo = false;
    }

    if (!lookup.success || !lookup.case) {
      return NextResponse.json({ success: false, error: 'Case not found or invalid credentials.' }, { status: 401 });
    }

    const message = await GrievanceService.addMessage({
      organizationId: lookup.case.id,
      grievanceId: lookup.case.id,
      senderUserId: null,
      senderRole: 'EMPLOYEE',
      messageText: messageText.trim(),
      isInternalNote: false,
      isDemo,
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PEOPLEPULSE AI — Synthetic Demo Case Lookup API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';
import { isDemoModeEnabled } from '@/lib/auth/demo-session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!isDemoModeEnabled()) {
      return NextResponse.json({ success: false, error: 'Anonymous case tracking is unavailable on this deployment.' }, { status: 503 });
    }
    const body = await request.json();
    const { caseNumber, passcode } = body;

    if (
      typeof caseNumber !== 'string' || caseNumber.length > 64 ||
      typeof passcode !== 'string' || passcode.length > 128
    ) {
      return NextResponse.json(
        { success: false, error: 'Case Number and Access Passcode are required.' },
        { status: 400 }
      );
    }

    const result = await GrievanceService.trackAnonymousGrievance(caseNumber.trim(), passcode.trim(), true);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

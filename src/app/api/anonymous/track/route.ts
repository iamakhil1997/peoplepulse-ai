// PEOPLEPULSE AI — Zero-Knowledge Anonymous Case Lookup API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseNumber, passcode } = body;

    if (!caseNumber || !passcode) {
      return NextResponse.json(
        { success: false, error: 'Case Number and Access Passcode are required.' },
        { status: 400 }
      );
    }

    // Try demo store first, then fallback
    let result = await GrievanceService.trackAnonymousGrievance(caseNumber.trim(), passcode.trim(), true);
    if (!result.success) {
      result = await GrievanceService.trackAnonymousGrievance(caseNumber.trim(), passcode.trim(), false);
    }

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

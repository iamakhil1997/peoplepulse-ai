// PEOPLEPULSE AI — Zero-Knowledge Anonymous Case Lookup API

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';

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

    const result = await GrievanceService.trackAnonymousGrievance(caseNumber.trim(), passcode.trim());

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

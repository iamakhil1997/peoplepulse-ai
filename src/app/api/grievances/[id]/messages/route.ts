// PEOPLEPULSE AI — Grievance Message & Internal HR Notes API
// Supports both standard Supabase and isolated synthetic Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';
import { getSession } from '@/lib/auth/get-session';
import { demoDataStore } from '@/lib/store/demo-store';
import { DemoRole } from '@/lib/auth/demo-session';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
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

    // Demo Mode Message Routing
    if (session?.isDemo) {
      const addedMessage = demoDataStore.addMessage(
        params.id,
        messageText.trim(),
        Boolean(isInternalNote),
        session.roleName as DemoRole,
        session.id
      );

      if (!addedMessage) {
        return NextResponse.json(
          { success: false, error: 'Case not found or permission denied.' },
          { status: 403 }
        );
      }

      return NextResponse.json({ success: true, data: addedMessage });
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

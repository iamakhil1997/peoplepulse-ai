// PEOPLEPULSE AI — Grievance Message & Internal HR Notes API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';
import { getSession } from '@/lib/auth/get-session';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { messageText, isInternalNote = false } = body;

    if (!messageText || !messageText.trim()) {
      return NextResponse.json({ success: false, error: 'Message text cannot be empty' }, { status: 400 });
    }

    const organizationId = session?.organizationId || '00000000-0000-0000-0000-000000000001';
    const isDemo = Boolean(session?.isDemo);
    const senderRole = session?.roleName === 'Employee' ? 'EMPLOYEE' : 'HR';

    // Employees can NEVER write internal notes
    const sanitizedIsInternal = senderRole === 'EMPLOYEE' ? false : Boolean(isInternalNote);

    const message = await GrievanceService.addMessage({
      organizationId,
      grievanceId: params.id,
      senderUserId: session?.id || null,
      senderRole,
      messageText: messageText.trim(),
      isInternalNote: sanitizedIsInternal,
      isDemo,
    });

    if (!message) {
      return NextResponse.json({ success: false, error: 'Case not found or permission denied.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

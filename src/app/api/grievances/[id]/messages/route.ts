// PEOPLEPULSE AI — Grievance Message & Internal HR Notes API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';
import { requireDemoApiSession } from '@/lib/auth/demo-api-access';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await requireDemoApiSession({ writeDisabled: true });
    if (access.response) return access.response;
    const session = access.session!;
    const body = await request.json();
    const { messageText, isInternalNote = false } = body;
    const { id } = await params;

    if (!messageText || !messageText.trim()) {
      return NextResponse.json({ success: false, error: 'Message text cannot be empty' }, { status: 400 });
    }

    const organizationId = session.organizationId;
    const isDemo = true;
    const senderRole = session.roleName === 'Employee' ? 'EMPLOYEE' : 'HR';

    const detail = await GrievanceService.getGrievanceDetail(
      organizationId,
      id,
      session.roleName,
      session.id,
      isDemo
    );
    if (!detail) {
      return NextResponse.json({ success: false, error: 'Case not found or access denied.' }, { status: 404 });
    }

    // Employees can NEVER write internal notes
    const sanitizedIsInternal = senderRole === 'EMPLOYEE' ? false : Boolean(isInternalNote);

    const message = await GrievanceService.addMessage({
      organizationId,
      grievanceId: id,
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

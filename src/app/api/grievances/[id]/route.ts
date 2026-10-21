// PEOPLEPULSE AI — Grievance Detail & Status / Assignee Management API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';
import { getSession } from '@/lib/auth/get-session';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const orgId = session?.organizationId || searchParams.get('orgId') || '00000000-0000-0000-0000-000000000001';
    const isDemo = Boolean(session?.isDemo);

    const detail = await GrievanceService.getGrievanceDetail(
      orgId,
      params.id,
      session?.roleName,
      session?.id,
      isDemo
    );

    if (!detail) {
      return NextResponse.json(
        { success: false, error: 'Grievance not found or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...detail.grievance,
        messages: detail.messages,
        history: detail.history,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    if (session.roleName === 'Employee') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Employees cannot update case status.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, newStatus, reason, assignedToUserId } = body;
    const isDemo = Boolean(session.isDemo);

    if (action === 'update_status' && newStatus) {
      const updated = await GrievanceService.updateStatus({
        organizationId: session.organizationId,
        grievanceId: params.id,
        changedByUserId: session.id,
        newStatus,
        reason,
        role: session.roleName,
        isDemo,
      });

      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'Case not found or permission denied to update this case.' },
          { status: 403 }
        );
      }

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'assign' && assignedToUserId) {
      const assigned = await GrievanceService.assignGrievance({
        organizationId: session.organizationId,
        grievanceId: params.id,
        assignedByUserId: session.id,
        assignedToUserId,
        isDemo,
      });

      if (!assigned) {
        return NextResponse.json({ success: false, error: 'Assignment failed.' }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: assigned });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing parameters.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

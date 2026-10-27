// PEOPLEPULSE AI — Grievance Detail & Status / Assignee Management API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';
import { requireDemoApiSession } from '@/lib/auth/demo-api-access';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await requireDemoApiSession({ hrOnly: true });
    if (access.response) return access.response;
    const session = access.session!;
    const orgId = session.organizationId;
    const isDemo = true;
    const { id } = await params;

    const detail = await GrievanceService.getGrievanceDetail(
      orgId,
      id,
      session.roleName,
      session.id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await requireDemoApiSession({ hrOnly: true, writeDisabled: true });
    if (access.response) return access.response;
    const session = access.session!;

    const body = await request.json();
    const { action, newStatus, reason, assignedToUserId } = body;
    const isDemo = true;
    const { id } = await params;

    if (action === 'update_status' && newStatus) {
      const updated = await GrievanceService.updateStatus({
        organizationId: session.organizationId,
        grievanceId: id,
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
      if (!['HR', 'HR_Admin', 'Org_Admin', 'Super_Admin'].includes(session.roleName)) {
        return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
      }

      const assigned = await GrievanceService.assignGrievance({
        organizationId: session.organizationId,
        grievanceId: id,
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

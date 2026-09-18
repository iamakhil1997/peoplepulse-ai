// PEOPLEPULSE AI — Grievance Detail & Status / Assignee Management API

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || '00000000-0000-0000-0000-000000000001';
    const detail = await GrievanceService.getGrievanceDetailForHR(orgId, params.id);

    if (!detail) {
      return NextResponse.json({ success: false, error: 'Grievance not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: detail });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      organizationId = '00000000-0000-0000-0000-000000000001',
      hrUserId = '00000000-0000-0000-0003-000000000001',
      action,
      newStatus,
      reason,
      assignedToUserId,
    } = body;

    if (action === 'update_status' && newStatus) {
      const updated = await GrievanceService.updateStatus({
        organizationId,
        grievanceId: params.id,
        hrUserId,
        newStatus,
        reason,
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'assign' && assignedToUserId) {
      const assigned = await GrievanceService.assignGrievance({
        organizationId,
        grievanceId: params.id,
        assignedByUserId: hrUserId,
        assignedToUserId,
      });
      return NextResponse.json({ success: true, data: assigned });
    }

    return NextResponse.json({ success: false, error: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

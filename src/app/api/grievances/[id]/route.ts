// PEOPLEPULSE AI — Grievance Detail & Status / Assignee Management API
// Supports both standard Supabase and isolated synthetic Demo Mode

import { NextResponse } from 'next/server';
import { GrievanceService } from '@/lib/services/grievance-service';
import { getSession } from '@/lib/auth/get-session';
import { demoDataStore } from '@/lib/store/demo-store';
import { DemoRole } from '@/lib/auth/demo-session';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    // Isolated synthetic Demo Mode handler
    if (session?.isDemo) {
      const demoDetail = demoDataStore.getGrievanceById(
        params.id,
        session.roleName as DemoRole,
        session.id
      );

      if (!demoDetail) {
        return NextResponse.json(
          { success: false, error: 'Grievance not found or access denied.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          ...demoDetail.grievance,
          messages: demoDetail.messages,
        },
      });
    }

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
    const session = await getSession();

    if (session?.isDemo) {
      if (session.roleName === 'Employee') {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Employees cannot update case status.' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { action, newStatus } = body;

      if (action === 'update_status' && newStatus) {
        const updated = demoDataStore.updateGrievanceStatus(
          params.id,
          newStatus,
          session.roleName as DemoRole,
          session.id
        );

        if (!updated) {
          return NextResponse.json(
            { success: false, error: 'Case not found or permission denied to update this case.' },
            { status: 403 }
          );
        }

        return NextResponse.json({ success: true, data: updated });
      }

      return NextResponse.json(
        { success: false, error: 'Invalid demo action.' },
        { status: 400 }
      );
    }

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

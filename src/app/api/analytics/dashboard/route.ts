// PEOPLEPULSE AI — Executive Dashboard Analytics API
// Supports live database querying with persistent fallback and demo mode isolation

import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { requireDemoApiSession } from '@/lib/auth/demo-api-access';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const access = await requireDemoApiSession({ managerOnly: true });
    if (access.response) return access.response;
    const session = access.session!;
    const orgId = session.organizationId;

    const metrics = await AnalyticsService.getExecutiveDashboardMetrics(orgId, true);
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
